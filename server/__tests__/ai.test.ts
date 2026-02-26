import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
global.fetch = mockFetch

vi.stubGlobal('createError', (opts: { statusCode: number; message: string }) => {
  const error = new Error(opts.message)
  ;(error as unknown as { statusCode: number }).statusCode = opts.statusCode
  return error
})

describe('AI Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    vi.stubGlobal('useRuntimeConfig', () => ({
      qwenApiKey: 'test-api-key',
      qwenApiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      qwenModel: 'qwen-plus',
      qwenSystemPrompt: '你是TomyBot智能助手，一个专业、友好、高效的客服AI。请用简洁、专业的语言回答用户问题。'
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('chatWithQwen', () => {
    it('should send message and return AI response', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you?'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      const result = await chatWithQwen([{ role: 'user', content: 'Hello' }])

      expect(result.content).toBe('Hello! How can I help you?')
      expect(result.usage?.totalTokens).toBe(30)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json'
          })
        })
      )
    })

    it('should include system message in request', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      await chatWithQwen([{ role: 'user', content: 'Hi' }])

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.messages[0].role).toBe('system')
      expect(body.messages[0].content).toContain('TomyBot')
    })

    it('should throw error when API key not configured', async () => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        qwenApiKey: '',
        qwenApiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        qwenModel: 'qwen-plus',
        qwenSystemPrompt: 'You are helpful.'
      }))

      const { chatWithQwen } = await import('../utils/ai')

      await expect(chatWithQwen([{ role: 'user', content: 'Hi' }])).rejects.toThrow()
    })

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limited')
      })

      const { chatWithQwen } = await import('../utils/ai')

      await expect(chatWithQwen([{ role: 'user', content: 'Hi' }])).rejects.toThrow()
    })

    it('should return empty content when no content in response', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: { role: 'assistant', content: '' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      const result = await chatWithQwen([{ role: 'user', content: 'Hi' }])

      expect(result.content).toBe('')
    })

    it('should use custom model when specified', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      await chatWithQwen([{ role: 'user', content: 'Hi' }], { model: 'qwen-max' })

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.model).toBe('qwen-max')
    })

    it('should use custom temperature and maxTokens', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      await chatWithQwen([{ role: 'user', content: 'Hi' }], {
        temperature: 0.5,
        maxTokens: 1000
      })

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.temperature).toBe(0.5)
      expect(body.max_tokens).toBe(1000)
    })

    it('should include enable_search when specified', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      await chatWithQwen([{ role: 'user', content: 'Hi' }], { enableSearch: true })

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.enable_search).toBe(true)
    })

    it('should include enable_thinking when specified', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response',
              reasoning_content: 'Let me think...'
            },
            finish_reason: 'stop'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      const result = await chatWithQwen([{ role: 'user', content: 'Hi' }], { enableThinking: true })

      expect(result.reasoningContent).toBe('Let me think...')
    })

    it('should include tools when specified', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: { role: 'assistant', content: 'Response' },
            finish_reason: 'stop'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const tools = [
        {
          type: 'function' as const,
          function: {
            name: 'get_weather',
            description: 'Get weather info',
            parameters: { type: 'object' }
          }
        }
      ]

      const { chatWithQwen } = await import('../utils/ai')
      await chatWithQwen([{ role: 'user', content: 'Hi' }], { tools })

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.tools).toHaveLength(1)
      expect(body.tools[0].function.name).toBe('get_weather')
    })

    it('should return tool calls in response', async () => {
      const mockResponse = {
        id: 'chat-123',
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call-1',
                  type: 'function',
                  function: {
                    name: 'get_weather',
                    arguments: '{"city": "Shanghai"}'
                  }
                }
              ]
            },
            finish_reason: 'tool_calls'
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const { chatWithQwen } = await import('../utils/ai')
      const result = await chatWithQwen([{ role: 'user', content: 'What is the weather?' }])

      expect(result.toolCalls).toHaveLength(1)
      expect(result.toolCalls?.[0].function.name).toBe('get_weather')
    })
  })

  describe('streamChatWithQwen', () => {
    it('should yield content chunks from stream', async () => {
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"id":"1","choices":[{"delta":{"content":"Hello"}}]}\n'
            )
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"id":"1","choices":[{"delta":{"content":" World"}}]}\n'
            )
          })
          .mockResolvedValueOnce({ done: true, value: undefined })
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      })

      const { streamChatWithQwen } = await import('../utils/ai')
      const chunks: string[] = []

      for await (const chunk of streamChatWithQwen([{ role: 'user', content: 'Hi' }])) {
        if (chunk.content) {
          chunks.push(chunk.content)
        }
      }

      expect(chunks).toEqual(['Hello', ' World'])
    })

    it('should yield reasoning content when available', async () => {
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"id":"1","choices":[{"delta":{"reasoning_content":"Thinking..."}}]}\n'
            )
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"id":"1","choices":[{"delta":{"content":"Answer"}}]}\n'
            )
          })
          .mockResolvedValueOnce({ done: true, value: undefined })
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      })

      const { streamChatWithQwen } = await import('../utils/ai')
      const results: Array<{ content?: string; reasoningContent?: string }> = []

      for await (const chunk of streamChatWithQwen([{ role: 'user', content: 'Hi' }])) {
        results.push({ content: chunk.content, reasoningContent: chunk.reasoningContent })
      }

      expect(results[0].reasoningContent).toBe('Thinking...')
      expect(results[1].content).toBe('Answer')
    })

    it('should skip [DONE] marker', async () => {
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"id":"1","choices":[{"delta":{"content":"Hi"}}]}\n'
            )
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n')
          })
          .mockResolvedValueOnce({ done: true, value: undefined })
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      })

      const { streamChatWithQwen } = await import('../utils/ai')
      const chunks: string[] = []

      for await (const chunk of streamChatWithQwen([{ role: 'user', content: 'Hi' }])) {
        if (chunk.content) {
          chunks.push(chunk.content)
        }
      }

      expect(chunks).toEqual(['Hi'])
    })

    it('should throw error when no reader available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: null
      })

      const { streamChatWithQwen } = await import('../utils/ai')

      await expect(async () => {
        for await (const _ of streamChatWithQwen([{ role: 'user', content: 'Hi' }])) {
          // consume iterator
        }
      }).rejects.toThrow()
    })

    it('should throw error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const { streamChatWithQwen } = await import('../utils/ai')

      await expect(async () => {
        for await (const _ of streamChatWithQwen([{ role: 'user', content: 'Hi' }])) {
          // consume iterator
        }
      }).rejects.toThrow()
    })
  })
})
