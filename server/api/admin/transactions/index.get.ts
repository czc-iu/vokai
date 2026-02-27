import { requireAdmin } from '../../../utils/adminAuth'
import { query, queryOne } from '../../../utils/db'
import { successResponse } from '../../../utils/response'

interface TransactionListOptions {
  type?: string
  userId?: number
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

const DEFAULT_LIMIT = 20
const DEFAULT_OFFSET = 0

export async function getTransactionsAdmin(options: TransactionListOptions = {}): Promise<any[]> {
  let sql = `
    SELECT t.*, u.email as user_email, u.name as user_name
    FROM token_transactions t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options.type) {
    sql += ` AND t.type = ?`
    params.push(options.type)
  }

  if (options.userId) {
    sql += ` AND t.user_id = ?`
    params.push(options.userId)
  }

  if (options.startDate) {
    sql += ` AND DATE(t.created_at) >= ?`
    params.push(options.startDate)
  }

  if (options.endDate) {
    sql += ` AND DATE(t.created_at) <= ?`
    params.push(options.endDate)
  }

  const sortBy = options.sortBy || 'created_at'
  const sortOrder = options.sortOrder || 'desc'
  sql += ` ORDER BY t.${sortBy} ${sortOrder}`

  const limit = options.limit ?? DEFAULT_LIMIT
  const offset = options.offset ?? DEFAULT_OFFSET
  sql += ` LIMIT ${limit} OFFSET ${offset}`

  return query<any[]>(sql, params)
}

export async function getTransactionsCount(options: TransactionListOptions = {}): Promise<number> {
  let sql = `
    SELECT COUNT(*) as count 
    FROM token_transactions t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options.type) {
    sql += ` AND t.type = ?`
    params.push(options.type)
  }

  if (options.userId) {
    sql += ` AND t.user_id = ?`
    params.push(options.userId)
  }

  if (options.startDate) {
    sql += ` AND DATE(t.created_at) >= ?`
    params.push(options.startDate)
  }

  if (options.endDate) {
    sql += ` AND DATE(t.created_at) <= ?`
    params.push(options.endDate)
  }

  const result = await queryOne<{ count: number }>(sql, params)
  return result?.count ?? 0
}

export async function getTransactionStats(): Promise<{
  totalPurchased: number
  totalConsumed: number
  totalRefunded: number
  totalGifted: number
  netChange: number
}> {
  const [purchase, consume, refund, gift] = await Promise.all([
    queryOne<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM token_transactions WHERE type = 'purchase'"),
    queryOne<{ total: number }>("SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM token_transactions WHERE type = 'consume'"),
    queryOne<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM token_transactions WHERE type = 'refund'"),
    queryOne<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM token_transactions WHERE type = 'gift'")
  ])

  const totalPurchased = purchase?.total ?? 0
  const totalConsumed = consume?.total ?? 0
  const totalRefunded = refund?.total ?? 0
  const totalGifted = gift?.total ?? 0

  return {
    totalPurchased,
    totalConsumed,
    totalRefunded,
    totalGifted,
    netChange: totalPurchased + totalRefunded + totalGifted - totalConsumed
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const offset = (page - 1) * limit

  const options: TransactionListOptions = {
    type: query.type as string | undefined,
    userId: query.userId ? parseInt(query.userId as string) : undefined,
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
    sortBy: (query.sortBy as string) || 'created_at',
    sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    limit,
    offset
  }

  const [transactions, total, stats] = await Promise.all([
    getTransactionsAdmin(options),
    getTransactionsCount(options),
    query.stats === 'true' ? getTransactionStats() : null
  ])

  const response: any = {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  if (stats) {
    response.stats = stats
  }

  return successResponse(response)
})
