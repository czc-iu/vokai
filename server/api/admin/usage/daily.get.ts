import { requireAdmin } from '../../../utils/adminAuth'
import { query, queryOne } from '../../../utils/db'
import { successResponse } from '../../../utils/response'

interface DailyUsageOptions {
  startDate?: string
  endDate?: string
  userId?: number
  limit?: number
}

export async function getDailyUsageAdmin(options: DailyUsageOptions = {}): Promise<any[]> {
  let sql = `
    SELECT d.*, u.email as user_email, u.name as user_name
    FROM token_daily_stats d
    LEFT JOIN users u ON d.user_id = u.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options.startDate) {
    sql += ` AND d.date >= ?`
    params.push(options.startDate)
  }

  if (options.endDate) {
    sql += ` AND d.date <= ?`
    params.push(options.endDate)
  }

  if (options.userId) {
    sql += ` AND d.user_id = ?`
    params.push(options.userId)
  }

  sql += ` ORDER BY d.date DESC`

  const limit = options.limit || 90
  sql += ` LIMIT ${limit}`

  return query<any[]>(sql, params)
}

export async function getUsageSummaryAdmin(): Promise<{
  totalTokensConsumed: number
  totalConversations: number
  totalMessages: number
  todayTokensConsumed: number
  todayConversations: number
  todayMessages: number
  activeUsersToday: number
}> {
  const today = new Date().toISOString().split('T')[0]

  const [total, todayStats, activeToday] = await Promise.all([
    queryOne<{
      tokens: number
      conversations: number
      messages: number
    }>(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(conversation_count), 0) as conversations,
        COALESCE(SUM(message_count), 0) as messages
      FROM token_daily_stats
    `),
    queryOne<{
      tokens: number
      conversations: number
      messages: number
    }>(`
      SELECT 
        COALESCE(SUM(total_tokens), 0) as tokens,
        COALESCE(SUM(conversation_count), 0) as conversations,
        COALESCE(SUM(message_count), 0) as messages
      FROM token_daily_stats
      WHERE date = ?
    `, [today]),
    queryOne<{ count: number }>(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM token_daily_stats
      WHERE date = ?
    `, [today])
  ])

  return {
    totalTokensConsumed: total?.tokens ?? 0,
    totalConversations: total?.conversations ?? 0,
    totalMessages: total?.messages ?? 0,
    todayTokensConsumed: todayStats?.tokens ?? 0,
    todayConversations: todayStats?.conversations ?? 0,
    todayMessages: todayStats?.messages ?? 0,
    activeUsersToday: activeToday?.count ?? 0
  }
}

export async function getUsageTrends(days: number = 30): Promise<{
  date: string
  tokens: number
  conversations: number
  messages: number
}[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return query<any[]>(`
    SELECT 
      date,
      SUM(total_tokens) as tokens,
      SUM(conversation_count) as conversations,
      SUM(message_count) as messages
    FROM token_daily_stats
    WHERE date >= ?
    GROUP BY date
    ORDER BY date ASC
  `, [startDate])
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const startDate = query.startDate as string | undefined
  const endDate = query.endDate as string | undefined
  const userId = query.userId ? parseInt(query.userId as string) : undefined
  const limit = parseInt(query.limit as string) || 100

  const [daily, summary] = await Promise.all([
    getDailyUsageAdmin({ startDate, endDate, userId, limit }),
    getUsageSummaryAdmin()
  ])

  return successResponse({
    daily,
    summary
  })
})
