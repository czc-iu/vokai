import { query, queryOne, update, insert } from './db'
import { hashPassword } from './auth'

export interface AdminUser {
  id: number
  email: string
  name: string | null
  phone: string | null
  phone_verified: boolean
  avatar: string | null
  company: string | null
  role: string
  status: string
  email_verified: boolean
  email_verified_at: Date | null
  last_login_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface AdminUserWithBalance extends AdminUser {
  balance: number
  total_purchased: number
  total_consumed: number
}

export interface AdminUserStats {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

interface UserListOptions {
  search?: string
  status?: string
  role?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

const DEFAULT_LIMIT = 20
const DEFAULT_OFFSET = 0

export async function getUsersAdmin(options: UserListOptions = {}): Promise<AdminUserWithBalance[]> {
  let sql = `
    SELECT u.*, 
           COALESCE(tb.balance, 0) as balance,
           COALESCE(tb.total_purchased, 0) as total_purchased,
           COALESCE(tb.total_consumed, 0) as total_consumed
    FROM users u
    LEFT JOIN token_balances tb ON u.id = tb.user_id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options.search) {
    sql += ` AND (u.email LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)`
    const searchPattern = `%${options.search}%`
    params.push(searchPattern, searchPattern, searchPattern)
  }

  if (options.status) {
    sql += ` AND u.status = ?`
    params.push(options.status)
  }

  if (options.role) {
    sql += ` AND u.role = ?`
    params.push(options.role)
  }

  const sortBy = options.sortBy || 'created_at'
  const sortOrder = options.sortOrder || 'desc'
  sql += ` ORDER BY u.${sortBy} ${sortOrder}`

  const limit = options.limit ?? DEFAULT_LIMIT
  const offset = options.offset ?? DEFAULT_OFFSET
  sql += ` LIMIT ${limit} OFFSET ${offset}`

  return query<AdminUserWithBalance[]>(sql, params)
}

export async function getUsersCount(options: UserListOptions = {}): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1'
  const params: (string | number)[] = []

  if (options.search) {
    sql += ` AND (email LIKE ? OR name LIKE ? OR phone LIKE ?)`
    const searchPattern = `%${options.search}%`
    params.push(searchPattern, searchPattern, searchPattern)
  }

  if (options.status) {
    sql += ` AND status = ?`
    params.push(options.status)
  }

  if (options.role) {
    sql += ` AND role = ?`
    params.push(options.role)
  }

  const result = await queryOne<{ count: number }>(sql, params)
  return result?.count ?? 0
}

export async function getUserAdmin(userId: number): Promise<AdminUserWithBalance | null> {
  const sql = `
    SELECT u.*, 
           COALESCE(tb.balance, 0) as balance,
           COALESCE(tb.total_purchased, 0) as total_purchased,
           COALESCE(tb.total_consumed, 0) as total_consumed
    FROM users u
    LEFT JOIN token_balances tb ON u.id = tb.user_id
    WHERE u.id = ?
  `
  return queryOne<AdminUserWithBalance>(sql, [userId])
}

export async function updateUserAdmin(
  userId: number,
  data: Partial<{
    name: string
    phone: string
    company: string
    avatar: string
  }>
): Promise<boolean> {
  const result = await update('users', data, 'id = ?', [userId])
  return result.affectedRows > 0
}

export async function updateUserStatus(userId: number, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> {
  const result = await update('users', { status }, 'id = ?', [userId])
  return result.affectedRows > 0
}

export async function updateUserRole(userId: number, role: 'user' | 'admin'): Promise<boolean> {
  const result = await update('users', { role }, 'id = ?', [userId])
  return result.affectedRows > 0
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  const hashedPassword = await hashPassword(newPassword)
  const result = await update('users', { password_hash: hashedPassword }, 'id = ?', [userId])
  return result.affectedRows > 0
}

export async function adjustUserBalance(
  userId: number,
  amount: number,
  type: 'purchase' | 'consume' | 'refund' | 'gift',
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  const balance = await queryOne<{ balance: number }>(
    'SELECT balance FROM token_balances WHERE user_id = ?',
    [userId]
  )

  let currentBalance = balance?.balance ?? 0
  
  if (!balance) {
    await insert('token_balances', {
      user_id: userId,
      balance: 0,
      total_purchased: 0,
      total_consumed: 0
    })
    currentBalance = 0
  }

  const newBalance = currentBalance + amount

  if (newBalance < 0) {
    return { success: false, newBalance: currentBalance }
  }

  await update(
    'token_balances',
    {
      balance: newBalance,
      total_purchased: type === 'purchase' || type === 'gift' 
        ? amount 
        : 0,
      total_consumed: type === 'consume' ? -amount : 0
    },
    'user_id = ?',
    [userId]
  )

  await insert('token_transactions', {
    user_id: userId,
    type,
    amount,
    balance_after: newBalance,
    description,
    reference_type: 'admin_adjustment'
  })

  return { success: true, newBalance }
}

export async function getUserStatsAdmin(): Promise<AdminUserStats> {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [totalResult, activeResult, todayResult, weekResult, monthResult] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users'),
    queryOne<{ count: number }>("SELECT COUNT(*) as count FROM users WHERE status = 'active'"),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?', [today]),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= ?', [weekAgo]),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) >= ?', [monthAgo])
  ])

  return {
    totalUsers: totalResult?.count ?? 0,
    activeUsers: activeResult?.count ?? 0,
    newUsersToday: todayResult?.count ?? 0,
    newUsersThisWeek: weekResult?.count ?? 0,
    newUsersThisMonth: monthResult?.count ?? 0
  }
}

export async function getUserActivityStats(userId: number): Promise<{
  totalConversations: number
  totalMessages: number
  totalTokensConsumed: number
  lastActiveAt: Date | null
}> {
  const [convResult, msgResult, tokenResult] = await Promise.all([
    queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM conversations WHERE user_id = ?',
      [userId]
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM messages m 
       JOIN conversations c ON m.conversation_id = c.id 
       WHERE c.user_id = ?`,
      [userId]
    ),
    queryOne<{ total: number }>(
      'SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM token_transactions WHERE user_id = ? AND type = ?',
      [userId, 'consume']
    )
  ])

  const lastConv = await queryOne<{ updated_at: Date }>(
    'SELECT updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
    [userId]
  )

  return {
    totalConversations: convResult?.count ?? 0,
    totalMessages: msgResult?.count ?? 0,
    totalTokensConsumed: tokenResult?.total ?? 0,
    lastActiveAt: lastConv?.updated_at ?? null
  }
}
