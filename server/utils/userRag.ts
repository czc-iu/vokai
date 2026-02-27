import path from 'path'
import { LocalDocumentIndex } from 'vectra'
import { createEmbeddingHandler } from './embedding'
import { query } from './db'
import { buildContextFromResults, type SearchResult } from './rag'

const DEFAULT_TOP_K = 5
const DEFAULT_MAX_TOKENS = 2000

const userIndexes = new Map<number, LocalDocumentIndex>()

function getBaseIndexPath(): string {
  const config = useRuntimeConfig()
  return (config.ragIndexPath as string) || './.vectra'
}

function getUserIndexPath(userId: number): string {
  return path.join(getBaseIndexPath(), 'users', String(userId))
}

async function getUserIndex(userId: number): Promise<LocalDocumentIndex> {
  if (userIndexes.has(userId)) {
    return userIndexes.get(userId)!
  }

  const index = new LocalDocumentIndex({
    folderPath: getUserIndexPath(userId),
    embeddings: createEmbeddingHandler()
  })

  userIndexes.set(userId, index)
  return index
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
    const sections = await result.renderSections(1000, 3)
    searchResults.push({
      content: sections.map((s) => s.text).join('\n\n'),
      source: result.uri,
      score: result.score
    })
  }

  return searchResults
}

export async function indexUserDocument(
  userId: number,
  filename: string,
  content: string
): Promise<void> {
  const index = await getUserIndex(userId)
  await ensureIndexCreated(index)

  await index.upsertDocument(filename, content, 'markdown', {
    source: filename,
    userId,
    indexedAt: new Date().toISOString()
  })

  await query(
    'UPDATE user_documents SET is_indexed = TRUE WHERE user_id = ? AND filename = ?',
    [userId, filename]
  )
}

export async function deleteUserDocument(userId: number, filename: string): Promise<void> {
  const index = await getUserIndex(userId)

  try {
    await index.deleteDocument(filename)
  } catch (error) {
    console.error('Failed to delete document from index:', error)
  }
}

export async function searchUserDocuments(
  userId: number,
  queryText: string,
  topK = DEFAULT_TOP_K
): Promise<SearchResult[]> {
  const index = await getUserIndex(userId)

  if (!(await index.isIndexCreated())) {
    return []
  }

  const results = await index.queryDocuments(queryText, {
    maxDocuments: topK,
    maxChunks: 10
  })

  return transformSearchResults(results)
}

export async function getUserRAGContext(
  userId: number,
  queryText: string,
  maxTokens = DEFAULT_MAX_TOKENS
): Promise<string> {
  const results = await searchUserDocuments(userId, queryText, DEFAULT_TOP_K)
  return buildContextFromResults(results, '用户知识库内容：\n', maxTokens)
}

export function clearUserIndex(userId: number): void {
  userIndexes.delete(userId)
}

export function clearAllUserIndexes(): void {
  userIndexes.clear()
}

export async function resetAllUserIndexes(): Promise<{ reindexed: number; errors: string[] }> {
  const errors: string[] = []
  let reindexed = 0
  
  userIndexes.clear()
  
  const users = await query<{ user_id: number; filename: string; content: string }[]>(
    `SELECT ud.user_id, ud.filename, ud.content 
     FROM user_documents ud 
     WHERE ud.is_indexed = TRUE OR ud.is_indexed IS NULL`
  )
  
  for (const doc of users) {
    try {
      await indexUserDocument(doc.user_id, doc.filename, doc.content)
      reindexed++
    } catch (error) {
      errors.push(`User ${doc.user_id}/${doc.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return { reindexed, errors }
}
