import { query, queryOne, insert, remove } from './db'

export interface UserMemory {
  id: number
  user_id: number
  key: string
  value: string
  source: 'auto' | 'manual'
  created_at: Date
  updated_at: Date
}

export async function getUserMemories(userId: number): Promise<UserMemory[]> {
  return query<UserMemory[]>(
    'SELECT * FROM user_memories WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  )
}

export async function getMemory(userId: number, key: string): Promise<UserMemory | null> {
  return queryOne<UserMemory>(
    'SELECT * FROM user_memories WHERE user_id = ? AND `key` = ?',
    [userId, key]
  )
}

export async function setMemory(
  userId: number,
  key: string,
  value: string,
  source: 'auto' | 'manual' = 'manual'
): Promise<void> {
  const existing = await getMemory(userId, key)

  if (existing) {
    await query(
      'UPDATE user_memories SET value = ?, source = ?, updated_at = NOW() WHERE id = ?',
      [value, source, existing.id]
    )
  } else {
    await insert('user_memories', {
      user_id: userId,
      key,
      value,
      source
    })
  }
}

export async function deleteMemory(userId: number, key: string): Promise<boolean> {
  const result = await remove('user_memories', 'user_id = ? AND `key` = ?', [userId, key])
  return result.affectedRows > 0
}

export async function clearUserMemories(userId: number): Promise<void> {
  await remove('user_memories', 'user_id = ?', [userId])
}

export function formatMemoriesForPrompt(memories: UserMemory[]): string {
  if (memories.length === 0) return ''

  const lines = ['用户信息：', ...memories.map((m) => `- ${m.key}: ${m.value}`)]
  return lines.join('\n')
}

export function parseMemoryCommand(message: string): { action: 'remember' | 'forget'; key?: string; value?: string } | null {
  const rememberMatch = message.match(/^\/remember\s+(\S+)\s+(.+)$/i)
  if (rememberMatch) {
    return { action: 'remember', key: rememberMatch[1], value: rememberMatch[2] }
  }

  const forgetMatch = message.match(/^\/forget\s+(\S+)$/i)
  if (forgetMatch) {
    return { action: 'forget', key: forgetMatch[1] }
  }

  return null
}

const EXTRACTION_PATTERNS = [
  { pattern: /我叫([^\s，。！？,]+)/i, key: '姓名' },
  { pattern: /我是([^\s，。！？,]+(?:工程师|设计师|经理|总监|开发|产品|运营|市场|销售))/i, key: '职业' },
  { pattern: /我在([^\s，。！？,]+(?:公司|科技|集团))/i, key: '公司' },
  { pattern: /我的邮箱是\s*([^\s，。！？,]+@[^\s，。！？,]+)/i, key: '邮箱' },
  { pattern: /我的电话是\s*([0-9\-+\s]+)/i, key: '电话' },
  { pattern: /我住在([^\s，。！？,]+)/i, key: '城市' },
  { pattern: /我喜欢([^\s，。！？,]+)/i, key: '偏好' }
] as const

function extractMemoriesFromMessage(message: string): Array<{ key: string; value: string }> {
  const memories: Array<{ key: string; value: string }> = []

  for (const { pattern, key } of EXTRACTION_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      memories.push({ key, value: match[1] })
    }
  }

  return memories
}

export async function extractMemoriesFromConversation(
  userId: number,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .slice(-3)

  for (const msg of userMessages) {
    const extracted = extractMemoriesFromMessage(msg)
    for (const { key, value } of extracted) {
      await setMemory(userId, key, value, 'auto')
    }
  }
}
