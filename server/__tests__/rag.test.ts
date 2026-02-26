import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFs = {
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn()
}

vi.mock('fs', () => ({
  default: mockFs,
  existsSync: mockFs.existsSync,
  mkdirSync: mockFs.mkdirSync,
  readdirSync: mockFs.readdirSync,
  readFileSync: mockFs.readFileSync
}))

vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/'))
  }
}))

const mockIndex = {
  isIndexCreated: vi.fn(),
  createIndex: vi.fn(),
  upsertDocument: vi.fn(),
  queryDocuments: vi.fn(),
  getDocumentId: vi.fn(),
  deleteDocument: vi.fn(),
  getCatalogStats: vi.fn()
}

vi.mock('vectra', () => ({
  LocalDocumentIndex: vi.fn(() => mockIndex)
}))

vi.mock('../utils/embedding', () => ({
  getEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
  getEmbeddings: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  createEmbeddingHandler: vi.fn(() => ({
    maxTokens: 8000,
    createEmbeddings: vi.fn().mockResolvedValue({
      status: 'success',
      embeddings: [[0.1, 0.2, 0.3]]
    })
  }))
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  ragDocsPath: './docs',
  ragIndexPath: './.vectra'
}))

describe('RAG Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    mockIndex.isIndexCreated.mockReset()
    mockIndex.createIndex.mockReset()
    mockIndex.upsertDocument.mockReset()
    mockIndex.queryDocuments.mockReset()
    mockIndex.getDocumentId.mockReset()
    mockIndex.deleteDocument.mockReset()
    mockIndex.getCatalogStats.mockReset()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('indexDocuments', () => {
    it('should create docs directory if not exists', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockFs.mkdirSync.mockReturnValue(undefined)

      const { indexDocuments } = await import('../utils/rag')
      const result = await indexDocuments()

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./docs', { recursive: true })
      expect(result.indexed).toBe(0)
      expect(result.errors).toContain('Documents directory created. Add .md files to index.')
    })

    it('should index markdown files', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['doc1.md', 'doc2.md', 'ignore.txt'])
      mockFs.readFileSync.mockReturnValue('# Test Document\nContent here.')
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockResolvedValue(undefined)

      const { indexDocuments } = await import('../utils/rag')
      const result = await indexDocuments()

      expect(result.indexed).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(mockIndex.upsertDocument).toHaveBeenCalledTimes(2)
    })

    it('should create index if not exists', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['doc1.md'])
      mockFs.readFileSync.mockReturnValue('Content')
      mockIndex.isIndexCreated.mockResolvedValueOnce(false)
      mockIndex.createIndex.mockResolvedValue(undefined)
      mockIndex.upsertDocument.mockResolvedValue(undefined)

      const { indexDocuments } = await import('../utils/rag')
      await indexDocuments()

      expect(mockIndex.createIndex).toHaveBeenCalled()
    })

    it('should handle file read errors', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['error.md'])
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error')
      })
      mockIndex.isIndexCreated.mockResolvedValue(true)

      const { indexDocuments } = await import('../utils/rag')
      const result = await indexDocuments()

      expect(result.indexed).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('error.md')
    })

    it('should handle upsert errors', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['doc.md'])
      mockFs.readFileSync.mockReturnValue('Content')
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.upsertDocument.mockRejectedValue(new Error('Upsert failed'))

      const { indexDocuments } = await import('../utils/rag')
      const result = await indexDocuments()

      expect(result.indexed).toBe(0)
      expect(result.errors[0]).toContain('Upsert failed')
    })

    it('should handle empty docs directory', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['file.txt', 'image.png'])
      mockIndex.isIndexCreated.mockResolvedValue(true)

      const { indexDocuments } = await import('../utils/rag')
      const result = await indexDocuments()

      expect(result.indexed).toBe(0)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('searchDocuments', () => {
    it('should return empty array when index not created', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(false)

      const { searchDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await searchDocuments('test query')

      expect(result).toEqual([])
    })

    it('should return search results', async () => {
      const mockResults = [
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
      ]

      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue(mockResults)

      const { searchDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await searchDocuments('test query', 5)

      expect(result).toHaveLength(2)
      expect(result[0].source).toBe('doc1.md')
      expect(result[0].score).toBe(0.95)
      expect(result[0].content).toContain('Section 1 content')
      expect(mockIndex.queryDocuments).toHaveBeenCalledWith('test query', {
        maxDocuments: 5,
        maxChunks: 10
      })
    })

    it('should use default topK value', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { searchDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      await searchDocuments('query')

      expect(mockIndex.queryDocuments).toHaveBeenCalledWith('query', {
        maxDocuments: 5,
        maxChunks: 10
      })
    })

    it('should use custom topK value', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { searchDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      await searchDocuments('query', 10)

      expect(mockIndex.queryDocuments).toHaveBeenCalledWith('query', {
        maxDocuments: 10,
        maxChunks: 10
      })
    })

    it('should handle empty search results', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue([])

      const { searchDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await searchDocuments('nonexistent')

      expect(result).toEqual([])
    })
  })

  describe('getRAGContext', () => {
    it('should return empty string when no results', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(false)

      const { getRAGContext, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await getRAGContext('query')

      expect(result).toBe('')
    })

    it('should format context from search results', async () => {
      const mockResults = [
        {
          uri: 'doc1.md',
          score: 0.9,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Relevant content here' }
          ])
        }
      ]

      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue(mockResults)

      const { getRAGContext, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await getRAGContext('query')

      expect(result).toContain('相关文档内容')
      expect(result).toContain('--- doc1.md ---')
      expect(result).toContain('Relevant content here')
    })

    it('should respect maxTokens limit', async () => {
      const mockResults = [
        {
          uri: 'doc1.md',
          score: 0.9,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'A'.repeat(10000) }
          ])
        },
        {
          uri: 'doc2.md',
          score: 0.8,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'B'.repeat(10000) }
          ])
        }
      ]

      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue(mockResults)

      const { getRAGContext, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await getRAGContext('query', 100)

      expect(result.length).toBeLessThan(1000)
    })

    it('should include multiple documents within token limit', async () => {
      const mockResults = [
        {
          uri: 'doc1.md',
          score: 0.9,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Short content 1' }
          ])
        },
        {
          uri: 'doc2.md',
          score: 0.8,
          renderSections: vi.fn().mockResolvedValue([
            { text: 'Short content 2' }
          ])
        }
      ]

      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.queryDocuments.mockResolvedValue(mockResults)

      const { getRAGContext, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await getRAGContext('query', 500)

      expect(result).toContain('doc1.md')
      expect(result).toContain('doc2.md')
    })
  })

  describe('listDocuments', () => {
    it('should return empty array when docs path not exists', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { listDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await listDocuments()

      expect(result).toEqual([])
    })

    it('should list documents with indexing status', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['doc1.md', 'doc2.md'])
      mockIndex.getDocumentId
        .mockResolvedValueOnce('id-1')
        .mockResolvedValueOnce(null)

      const { listDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await listDocuments()

      expect(result).toHaveLength(2)
      expect(result[0].path).toBe('doc1.md')
      expect(result[0].chunkCount).toBe(1)
      expect(result[1].path).toBe('doc2.md')
      expect(result[1].chunkCount).toBe(0)
    })

    it('should handle getDocumentId errors', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['doc.md'])
      mockIndex.getDocumentId.mockRejectedValue(new Error('DB error'))

      const { listDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await listDocuments()

      expect(result).toHaveLength(1)
      expect(result[0].chunkCount).toBe(0)
    })

    it('should only list markdown files', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue(['doc.md', 'image.png', 'data.json'])
      mockIndex.getDocumentId.mockResolvedValue('id')

      const { listDocuments, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await listDocuments()

      expect(result).toHaveLength(1)
      expect(result[0].path).toBe('doc.md')
    })
  })

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      mockIndex.deleteDocument.mockResolvedValue(undefined)

      const { deleteDocument, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await deleteDocument('doc.md')

      expect(result).toBe(true)
      expect(mockIndex.deleteDocument).toHaveBeenCalledWith('doc.md')
    })

    it('should return false on delete error', async () => {
      mockIndex.deleteDocument.mockRejectedValue(new Error('Delete failed'))

      const { deleteDocument, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await deleteDocument('nonexistent.md')

      expect(result).toBe(false)
    })
  })

  describe('getIndexStatus', () => {
    it('should return not created status', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(false)

      const { getIndexStatus, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await getIndexStatus()

      expect(result.isCreated).toBe(false)
      expect(result.stats).toBeUndefined()
    })

    it('should return index stats when created', async () => {
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.getCatalogStats.mockResolvedValue({
        documents: 5,
        chunks: 20
      })

      const { getIndexStatus, clearIndex } = await import('../utils/rag')
      clearIndex()
      const result = await getIndexStatus()

      expect(result.isCreated).toBe(true)
      expect(result.stats?.documents).toBe(5)
      expect(result.stats?.chunks).toBe(20)
    })
  })

  describe('clearIndex', () => {
    it('should clear the cached index', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([])
      mockIndex.isIndexCreated.mockResolvedValue(true)
      mockIndex.getCatalogStats.mockResolvedValue({ documents: 0, chunks: 0 })

      const { clearIndex } = await import('../utils/rag')
      clearIndex()
      
      expect(mockIndex.isIndexCreated).toHaveBeenCalledTimes(0)
    })
  })
})
