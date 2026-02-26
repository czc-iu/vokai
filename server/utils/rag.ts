import fs from 'fs'
import path from 'path'
import { LocalDocumentIndex } from 'vectra'
import { createEmbeddingHandler } from './embedding'

export interface SearchResult {
  content: string
  source: string
  score: number
}

export interface DocumentInfo {
  path: string
  lastIndexed: Date
  chunkCount: number
}

export interface IndexStatus {
  isCreated: boolean
  stats?: {
    documents: number
    chunks: number
  }
}

export interface RAGConfig {
  docsPath: string
  indexPath: string
}

const DEFAULT_TOP_K = 5
const DEFAULT_MAX_CHUNKS = 10
const DEFAULT_MAX_TOKENS = 2000
const SECTION_MAX_TOKENS = 1000
const SECTION_MAX_COUNT = 3
const TOKEN_ESTIMATION_RATIO = 4

let documentIndex: LocalDocumentIndex | null = null

function getConfig(): RAGConfig {
  const config = useRuntimeConfig()
  return {
    docsPath: (config.ragDocsPath as string) || './docs',
    indexPath: (config.ragIndexPath as string) || './.vectra'
  }
}

async function getIndex(): Promise<LocalDocumentIndex> {
  if (documentIndex) {
    return documentIndex
  }

  const { indexPath } = getConfig()

  documentIndex = new LocalDocumentIndex({
    folderPath: indexPath,
    embeddings: createEmbeddingHandler()
  })

  return documentIndex
}

async function ensureIndexCreated(index: LocalDocumentIndex): Promise<void> {
  if (!(await index.isIndexCreated())) {
    await index.createIndex()
  }
}

async function transformSearchResults(
  results: Awaited<ReturnType<LocalDocumentIndex['queryDocuments']>>
): Promise<SearchResult[]> {
  const searchResults: SearchResult[] = []

  for (const result of results) {
    const sections = await result.renderSections(SECTION_MAX_TOKENS, SECTION_MAX_COUNT)
    searchResults.push({
      content: sections.map((s) => s.text).join('\n\n'),
      source: result.uri,
      score: result.score
    })
  }

  return searchResults
}

function buildContextFromResults(
  results: SearchResult[],
  header: string,
  maxTokens: number
): string {
  if (results.length === 0) {
    return ''
  }

  const contextParts: string[] = [header]
  let currentTokens = 0

  for (const result of results) {
    const estimatedTokens = result.content.length / TOKEN_ESTIMATION_RATIO

    if (currentTokens + estimatedTokens > maxTokens) {
      break
    }

    contextParts.push(`\n--- ${result.source} ---\n${result.content}\n`)
    currentTokens += estimatedTokens
  }

  return contextParts.join('')
}

export async function indexDocuments(): Promise<{ indexed: number; errors: string[] }> {
  const { docsPath } = getConfig()
  const errors: string[] = []
  let indexed = 0

  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true })
    return { indexed: 0, errors: ['Documents directory created. Add .md files to index.'] }
  }

  const index = await getIndex()
  await ensureIndexCreated(index)

  const files = fs.readdirSync(docsPath).filter((f) => f.endsWith('.md'))

  for (const file of files) {
    try {
      const filePath = path.join(docsPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')

      await index.upsertDocument(file, content, 'markdown', {
        source: file,
        indexedAt: new Date().toISOString()
      })

      indexed++
    } catch (error) {
      errors.push(`${file}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return { indexed, errors }
}

export async function searchDocuments(query: string, topK = DEFAULT_TOP_K): Promise<SearchResult[]> {
  const index = await getIndex()

  if (!(await index.isIndexCreated())) {
    return []
  }

  const results = await index.queryDocuments(query, {
    maxDocuments: topK,
    maxChunks: DEFAULT_MAX_CHUNKS
  })

  return transformSearchResults(results)
}

export async function getRAGContext(query: string, maxTokens = DEFAULT_MAX_TOKENS): Promise<string> {
  const results = await searchDocuments(query, DEFAULT_TOP_K)
  return buildContextFromResults(results, '相关文档内容：\n', maxTokens)
}

export async function listDocuments(): Promise<DocumentInfo[]> {
  const { docsPath } = getConfig()
  const documents: DocumentInfo[] = []

  if (!fs.existsSync(docsPath)) {
    return documents
  }

  const index = await getIndex()
  const files = fs.readdirSync(docsPath).filter((f) => f.endsWith('.md'))

  for (const file of files) {
    try {
      const docId = await index.getDocumentId(file)
      documents.push({
        path: file,
        lastIndexed: docId ? new Date() : new Date(0),
        chunkCount: docId ? 1 : 0
      })
    } catch {
      documents.push({
        path: file,
        lastIndexed: new Date(0),
        chunkCount: 0
      })
    }
  }

  return documents
}

export async function deleteDocument(uri: string): Promise<boolean> {
  const index = await getIndex()

  try {
    await index.deleteDocument(uri)
    return true
  } catch {
    return false
  }
}

export async function getIndexStatus(): Promise<IndexStatus> {
  const index = await getIndex()
  const isCreated = await index.isIndexCreated()

  if (!isCreated) {
    return { isCreated: false }
  }

  const stats = await index.getCatalogStats()

  return {
    isCreated: true,
    stats: {
      documents: stats.documents,
      chunks: stats.chunks
    }
  }
}

export function clearIndex(): void {
  documentIndex = null
}

export { buildContextFromResults, transformSearchResults }
