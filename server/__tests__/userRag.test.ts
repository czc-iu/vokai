import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockQuery = vi.fn()
const mockGetEmbedding = vi.fn()

const mockIndex = {
  isIndexCreated: vi.fn(),
  createIndex: vi.fn(),
  upsertDocument: vi.fn(),
  deleteDocument: vi.fn(),
  queryDocuments: vi.fn()
}

vi.mock('vectra', () => ({
  LocalDocumentIndex: vi.fn(() => mockIndex)
}))

vi.mock('../utils/embedding', () => ({
  getEmbedding: mockGetEmbedding,
  getEmbeddings: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  createEmbeddingHandler: vi.fn(() => ({
    maxTokens: 8000,
    createEmbeddings: vi.fn().mockResolvedValue({
      status: 'success',
      embeddings: [[0.1, 0.2, 0.3]]
    })
  }))
}))

vi.mock('../utils/db', () => ({
  query: mockQuery
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  ragIndexPath: './.vectra'
}))

describe('User RAG Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockIndex.isIndexCreated.mockReset()
    mockIndex.createIndex.mockReset()
    mockIndex.upsertDocument.mockReset()
    mockIndex.deleteDocument.mockReset()
    mockIndex.queryDocuments.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('indexUserDocument', () => {
    it('should create index and upsert document when index does not exist', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(false)
      mockIndex.createIndex.mockResolvedValue(undefined)
      mockIndex.upsertDocument.mockResolvedValue(undefined)
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { indexUserDocument } = await import('../utils/userRag')
      await indexUserDocument(1, 'test.md', '# Test Content')

      expect(mockIndex.isIndexCreated).toHaveBeenCalled()
      expect(mockIndex.createIndex).toHaveBeenCalled()
      expect(mockIndex.upsertDocument).toHaveBeenCalledWith(
        'test.md',
        '# Test Content',
        'markdown',
        expect.objectContaining({
          source: 'test.md',
          userId: 1
        })
      )
      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE user_documents SET is_indexed = TRUE WHERE user_id = ? AND filename = ?',
        [1, 'test.md']
      )
    })

    it('should not create index when it already exists', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockResolvedValue(undefined)
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { indexUserDocument } = await import('../utils/userRag')
      await indexUserDocument(1, 'test.md', '# Test Content')

      expect(mockIndex.isIndexCreated).toHaveBeenCalled()
      expect(mockIndex.createIndex).not.toHaveBeenCalled()
      expect(mockIndex.upsertDocument).toHaveBeenCalled()
    })

    it('should handle different user IDs', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockResolvedValue(undefined)
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { indexUserDocument } = await import('../utils/userRag')
      await indexUserDocument(999, 'doc.md', 'Content')

      expect(mockIndex.upsertDocument).toHaveBeenCalledWith(
        'doc.md',
        'Content',
        'markdown',
        expect.objectContaining({
          userId: 999
        })
      )
    })

    it('should handle empty content', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockResolvedValue(undefined)
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { indexUserDocument } = await import('../utils/userRag')
      await indexUserDocument(1, 'empty.md', '')

      expect(mockIndex.upsertDocument).toHaveBeenCalledWith(
        'empty.md',
        '',
        'markdown',
        expect.any(Object)
      )
    })

    it('should propagate upsert errors', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockRejectedValue(new Error('Upsert failed'))

      const { indexUserDocument } = await import('../utils/userRag')
      
      await expect(indexUserDocument(1, 'test.md', 'content')).rejects.toThrow('Upsert failed')
    })

    it('should propagate database query errors', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockResolvedValue(undefined)
      mockQuery.mockRejectedValue(new Error('DB error'))

      const { indexUserDocument } = await import('../utils/userRag')
      
      await expect(indexUserDocument(1, 'test.md', 'content')).rejects.toThrow('DB error')
    })
  })

  describe('deleteUserDocument', () => {
    it('should delete document from index', async () => {
      mockIndex.deleteDocument.mockResolvedValue(undefined)

      const { deleteUserDocument } = await import('../utils/userRag')
      await deleteUserDocument(1, 'test.md')

      expect(mockIndex.deleteDocument).toHaveBeenCalledWith('test.md')
    })

    it('should handle delete errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockIndex.deleteDocument.mockRejectedValue(new Error('Delete failed'))

      const { deleteUserDocument } = await import('../utils/userRag')
      await deleteUserDocument(1, 'test.md')

      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete document from index:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should handle non-existent document', async () => {
      mockIndex.deleteDocument.mockResolvedValue(undefined)

      const { deleteUserDocument } = await import('../utils/userRag')
      await deleteUserDocument(1, 'nonexistent.md')

      expect(mockIndex.deleteDocument).toHaveBeenCalledWith('nonexistent.md')
    })
  })

  describe('searchUserDocuments', () => {
    it('should return empty array when index does not exist', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(false)

      const { searchUserDocuments } = await import('../utils/userRag')
      const result = await searchUserDocuments(1, 'test query')

      expect(result).toEqual([])
      expect(mockIndex.queryDocuments).not.toHaveBeenCalled()
    })

    it('should return search results when index exists', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'doc1.md',
          score: 0.95,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Section 1 content' },
            { text: 'Section 2 content' }
          ])
        },
        {
          uri: 'doc2.md',
          score: 0.85,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Another section' }
          ])
        }
      ])

      const { searchUserDocuments } = await import('../utils/userRag')
      const result = await searchUserDocuments(1, 'test query')

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        content: 'Section 1 content\n\nSection 2 content',
        source: 'doc1.md',
        score: 0.95
      })
      expect(result[1]).toEqual({
        content: 'Another section',
        source: 'doc2.md',
        score: 0.85
      })
    })

    it('should respect topK parameter', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { searchUserDocuments } = await import('../utils/userRag')
      await searchUserDocuments(1, 'test query', 10)

      expect(mockIndex.queryDocuments).toHaveBeenCalledWith('test query', {
        maxDocuments: 10,
        maxChunks: 10
      })
    })

    it('should use default topK of 5', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { searchUserDocuments } = await import('../utils/userRag')
      await searchUserDocuments(1, 'test query')

      expect(mockIndex.queryDocuments).toHaveBeenCalledWith('test query', {
        maxDocuments: 5,
        maxChunks: 10
      })
    })

    it('should handle empty search results', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { searchUserDocuments } = await import('../utils/userRag')
      const result = await searchUserDocuments(1, 'nonexistent')

      expect(result).toEqual([])
    })

    it('should handle renderSections errors', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'doc1.md',
          score: 0.95,
          renderSections: vi.fn().mockRejectedValue(new Error('Render failed'))
        }
      ])

      const { searchUserDocuments } = await import('../utils/userRag')
      
      await expect(searchUserDocuments(1, 'test query')).rejects.toThrow('Render failed')
    })
  })

  describe('getUserRAGContext', () => {
    it('should return empty string when no results found', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { getUserRAGContext } = await import('../utils/userRag')
      const result = await getUserRAGContext(1, 'test query')

      expect(result).toBe('')
    })

    it('should return formatted context with results', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'doc1.md',
          score: 0.95,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'This is relevant content.' }
          ])
        }
      ])

      const { getUserRAGContext } = await import('../utils/userRag')
      const result = await getUserRAGContext(1, 'test query')

      expect(result).toContain('用户知识库内容：')
      expect(result).toContain('--- doc1.md ---')
      expect(result).toContain('This is relevant content.')
    })

    it('should respect maxTokens limit', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'doc1.md',
          score: 0.95,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'A'.repeat(10000) }
          ])
        },
        {
          uri: 'doc2.md',
          score: 0.85,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'B'.repeat(10000) }
          ])
        }
      ])

      const { getUserRAGContext } = await import('../utils/userRag')
      const result = await getUserRAGContext(1, 'test query', 100)

      expect(result.length).toBeLessThan(500)
    })

    it('should include multiple documents in context', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'doc1.md',
          score: 0.95,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'First document' }
          ])
        },
        {
          uri: 'doc2.md',
          score: 0.85,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Second document' }
          ])
        }
      ])

      const { getUserRAGContext } = await import('../utils/userRag')
      const result = await getUserRAGContext(1, 'test query', 10000)

      expect(result).toContain('doc1.md')
      expect(result).toContain('doc2.md')
      expect(result).toContain('First document')
      expect(result).toContain('Second document')
    })

    it('should use default maxTokens of 2000', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'doc1.md',
          score: 0.95,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Short content' }
          ])
        }
      ])

      const { getUserRAGContext } = await import('../utils/userRag')
      const result = await getUserRAGContext(1, 'test query')

      expect(result).toContain('Short content')
    })

    it('should handle special characters in content', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([
        {
          uri: 'special.md',
          score: 0.95,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Content with <html> & "quotes" and \n newlines' }
          ])
        }
      ])

      const { getUserRAGContext } = await import('../utils/userRag')
      const result = await getUserRAGContext(1, 'test query')

      expect(result).toContain('<html>')
      expect(result).toContain('&')
      expect(result).toContain('"quotes"')
    })
  })
})
