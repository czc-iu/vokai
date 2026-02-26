import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

vi.stubGlobal('createError', (opts: { statusCode: number; message: string }) => {
  const error = new Error(opts.message)
  ;(error as unknown as { statusCode: number }).statusCode = opts.statusCode
  return error
})

describe('Embedding Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    vi.stubGlobal('useRuntimeConfig', () => ({
      qwenApiKey: 'test-api-key'
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getEmbedding', () => {
    it('should return embedding for single text', async () => {
      const mockEmbedding = new Array(1024).fill(0).map((_, i) => i * 0.001)
      const mockResponse = {
        output: {
          embeddings: [
            { text_index: 0, embedding: mockEmbedding }
          ]
        },
        usage: { total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbedding } = await import('../utils/embedding')
      const result = await getEmbedding('Hello world')

      expect(result).toEqual(mockEmbedding)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should send correct request body', async () => {
      const mockResponse = {
        output: { embeddings: [{ text_index: 0, embedding: [0.1, 0.2, 0.3] }] },
        usage: { total_tokens: 5 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbedding } = await import('../utils/embedding')
      await getEmbedding('Test text')

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.model).toBe('text-embedding-v3')
      expect(body.input.texts).toEqual(['Test text'])
      expect(body.parameters.text_type).toBe('document')
    })

    it('should throw error when API key not configured', async () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        qwenApiKey: ''
      }))

      const { getEmbedding } = await import('../utils/embedding')

      await expect(getEmbedding('Test')).rejects.toThrow()
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error')
      })

      const { getEmbedding } = await import('../utils/embedding')

      await expect(getEmbedding('Test')).rejects.toThrow()
    })

    it('should throw error with correct status code on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limited')
      })

      const { getEmbedding } = await import('../utils/embedding')

      try {
        await getEmbedding('Test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as unknown as { statusCode: number }).statusCode).toBe(429)
      }
    })

    it('should handle empty text', async () => {
      const mockResponse = {
        output: { embeddings: [{ text_index: 0, embedding: [] }] },
        usage: { total_tokens: 0 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbedding } = await import('../utils/embedding')
      const result = await getEmbedding('')

      expect(result).toEqual([])
    })

    it('should handle long text', async () => {
      const longText = 'a'.repeat(10000)
      const mockResponse = {
        output: { embeddings: [{ text_index: 0, embedding: [0.1] }] },
        usage: { total_tokens: 2500 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbedding } = await import('../utils/embedding')
      const result = await getEmbedding(longText)

      expect(result).toEqual([0.1])
    })
  })

  describe('getEmbeddings', () => {
    it('should return embeddings for multiple texts', async () => {
      const mockResponse = {
        output: {
          embeddings: [
            { text_index: 0, embedding: [0.1, 0.2, 0.3] },
            { text_index: 1, embedding: [0.4, 0.5, 0.6] },
            { text_index: 2, embedding: [0.7, 0.8, 0.9] }
          ]
        },
        usage: { total_tokens: 30 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbeddings } = await import('../utils/embedding')
      const result = await getEmbeddings(['Hello', 'World', 'Test'])

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual([0.1, 0.2, 0.3])
      expect(result[1]).toEqual([0.4, 0.5, 0.6])
      expect(result[2]).toEqual([0.7, 0.8, 0.9])
    })

    it('should send correct request body for multiple texts', async () => {
      const mockResponse = {
        output: { embeddings: [
          { text_index: 0, embedding: [0.1, 0.2] },
          { text_index: 1, embedding: [0.3, 0.4] }
        ]},
        usage: { total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbeddings } = await import('../utils/embedding')
      await getEmbeddings(['Text 1', 'Text 2'])

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.input.texts).toEqual(['Text 1', 'Text 2'])
    })

    it('should throw error when API key not configured', async () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        qwenApiKey: ''
      }))

      const { getEmbeddings } = await import('../utils/embedding')

      await expect(getEmbeddings(['Test'])).rejects.toThrow()
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request')
      })

      const { getEmbeddings } = await import('../utils/embedding')

      await expect(getEmbeddings(['Test'])).rejects.toThrow()
    })

    it('should throw error with correct status code on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      })

      const { getEmbeddings } = await import('../utils/embedding')

      try {
        await getEmbeddings(['Test'])
        expect.fail('Should have thrown')
      } catch (error) {
        expect((error as unknown as { statusCode: number }).statusCode).toBe(401)
      }
    })

    it('should handle empty array', async () => {
      const { getEmbeddings } = await import('../utils/embedding')
      
      // Empty array should return empty embeddings without calling API
      const result = await getEmbeddings([])
      
      expect(result).toEqual([])
    })

    it('should handle single text in array', async () => {
      const mockResponse = {
        output: { embeddings: [{ text_index: 0, embedding: [0.5] }] },
        usage: { total_tokens: 5 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbeddings } = await import('../utils/embedding')
      const result = await getEmbeddings(['Single text'])

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([0.5])
    })

    it('should preserve text index order in response', async () => {
      const mockResponse = {
        output: {
          embeddings: [
            { text_index: 1, embedding: [0.4, 0.5, 0.6] },
            { text_index: 0, embedding: [0.1, 0.2, 0.3] }
          ]
        },
        usage: { total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbeddings } = await import('../utils/embedding')
      const result = await getEmbeddings(['First', 'Second'])

      expect(result[0]).toEqual([0.4, 0.5, 0.6])
      expect(result[1]).toEqual([0.1, 0.2, 0.3])
    })

    it('should handle large batch of texts', async () => {
      const texts = Array(25).fill('test text')
      const mockResponse = {
        output: {
          embeddings: texts.map((_, i) => ({
            text_index: i,
            embedding: [i * 0.1]
          }))
        },
        usage: { total_tokens: 100 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { getEmbeddings } = await import('../utils/embedding')
      const result = await getEmbeddings(texts)

      expect(result).toHaveLength(25)
    })
  })
})
