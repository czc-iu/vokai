import { query, queryOne, insert } from './db'

export interface TokenBalance {
  id: number
  user_id: number
  balance: number
  total_purchased: number
  total_consumed: number
  created_at: Date
  updated_at: Date
}

export interface TokenTransaction {
  id: number
  user_id: number
  type: 'purchase' | 'consume' | 'refund' | 'gift'
  amount: number
  balance_after: number
  description: string | null
  reference_type: string | null
  reference_id: number | null
  created_at: Date
}

export interface DailyStat {
  date: string
  total_tokens: number
  conversation_count: number
  message_count: number
}

type TransactionType = 'purchase' | 'consume' | 'refund' | 'gift'

interface PaginationOptions {
  type?: string
  limit?: number
  offset?: number
}

const DEFAULT_LIMIT = 20
const DEFAULT_OFFSET = 0

async function fetchBalanceByUserId(userId: number): Promise<TokenBalance | null> {
  return queryOne<TokenBalance>(
    'SELECT * FROM token_balances WHERE user_id = ?',
    [userId]
  )
}

async function createInitialBalance(userId: number): Promise<void> {
  await insert('token_balances', {
    user_id: userId,
    balance: 0,
    total_purchased: 0,
    total_consumed: 0
  })
}

async function recordTransaction(
  userId: number,
  type: TransactionType,
  amount: number,
  balanceAfter: number,
  description?: string,
  referenceType?: string,
  referenceId?: number
): Promise<void> {
  await insert('token_transactions', {
    user_id: userId,
    type,
    amount,
    balance_after: balanceAfter,
    description: description ?? null,
    reference_type: referenceType ?? null,
    reference_id: referenceId ?? null
  })
}

function buildPaginationSQL(
  baseSQL: string,
  params: (string | number)[],
  options?: PaginationOptions
): { sql: string; params: (string | number)[] } {
  let sql = baseSQL
  const finalParams = [...params]

  if (options?.type) {
    sql += ' AND type = ?'
    finalParams.push(options.type)
  }

  sql += ' ORDER BY created_at DESC'

  const limit = options?.limit ?? DEFAULT_LIMIT
  const offset = options?.offset ?? DEFAULT_OFFSET
  sql += ` LIMIT ${limit} OFFSET ${offset}`

  return { sql, params: finalParams }
}

function buildDateRangeSQL(
  baseSQL: string,
  params: (string | number)[],
  startDate?: string,
  endDate?: string
): { sql: string; params: (string | number)[] } {
  let sql = baseSQL
  const finalParams = [...params]

  if (startDate) {
    sql += ' AND date >= ?'
    finalParams.push(startDate)
  }

  if (endDate) {
    sql += ' AND date <= ?'
    finalParams.push(endDate)
  }

  sql += ' ORDER BY date DESC LIMIT 90'

  return { sql, params: finalParams }
}

export async function getOrCreateBalance(userId: number): Promise<TokenBalance> {
  let balance = await fetchBalanceByUserId(userId)

  if (!balance) {
    await createInitialBalance(userId)
    balance = await fetchBalanceByUserId(userId)
  }

  return balance!
}

export async function getBalance(userId: number): Promise<number> {
  const balance = await getOrCreateBalance(userId)
  return balance.balance
}

export async function addTokens(
  userId: number,
  amount: number,
  type: 'purchase' | 'refund' | 'gift',
  description?: string,
  referenceType?: string,
  referenceId?: number
): Promise<TokenBalance> {
  const currentBalance = await getOrCreateBalance(userId)
  const newBalance = currentBalance.balance + amount
  const shouldUpdateTotalPurchased = type === 'purchase' || type === 'gift'
  const newTotalPurchased = shouldUpdateTotalPurchased
    ? currentBalance.total_purchased + amount
    : currentBalance.total_purchased

  await query(
    'UPDATE token_balances SET balance = ?, total_purchased = ? WHERE user_id = ?',
    [newBalance, newTotalPurchased, userId]
  )

  await recordTransaction(userId, type, amount, newBalance, description, referenceType, referenceId)

  return (await fetchBalanceByUserId(userId))!
}

export async function consumeTokens(
  userId: number,
  amount: number,
  description?: string,
  referenceType?: string,
  referenceId?: number
): Promise<boolean> {
  const currentBalance = await getOrCreateBalance(userId)

  if (currentBalance.balance < amount) {
    return false
  }

  const newBalance = currentBalance.balance - amount
  const newTotalConsumed = currentBalance.total_consumed + amount

  await query(
    'UPDATE token_balances SET balance = ?, total_consumed = ? WHERE user_id = ?',
    [newBalance, newTotalConsumed, userId]
  )

  await recordTransaction(userId, 'consume', -amount, newBalance, description, referenceType, referenceId)

  return true
}

export async function getTransactions(
  userId: number,
  options?: PaginationOptions
): Promise<TokenTransaction[]> {
  const { sql, params } = buildPaginationSQL(
    'SELECT * FROM token_transactions WHERE user_id = ?',
    [userId],
    options
  )

  return query<TokenTransaction[]>(sql, params)
}

export async function getTransactionCount(userId: number, type?: string): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM token_transactions WHERE user_id = ?'
  const params: (string | number)[] = [userId]

  if (type) {
    sql += ' AND type = ?'
    params.push(type)
  }

  const result = await queryOne<{ count: number }>(sql, params)
  return result?.count ?? 0
}

export async function recordDailyConsumption(
  userId: number,
  tokens: number,
  messages: number = 1
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  const existing = await queryOne<{ id: number }>(
    'SELECT id FROM token_daily_stats WHERE user_id = ? AND date = ?',
    [userId, today]
  )

  if (existing) {
    await updateDailyStat(existing.id, tokens, messages)
  } else {
    await createDailyStat(userId, today, tokens, messages)
  }
}

async function updateDailyStat(id: number, tokens: number, messages: number): Promise<void> {
  await query(
    `UPDATE token_daily_stats 
     SET total_tokens = total_tokens + ?, 
         message_count = message_count + ?,
         conversation_count = conversation_count + 1
     WHERE id = ?`,
    [tokens, messages, id]
  )
}

async function createDailyStat(
  userId: number,
  date: string,
  tokens: number,
  messages: number
): Promise<void> {
  await insert('token_daily_stats', {
    user_id: userId,
    date,
    total_tokens: tokens,
    conversation_count: 1,
    message_count: messages
  })
}

export async function getDailyStats(
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<DailyStat[]> {
  const { sql, params } = buildDateRangeSQL(
    'SELECT * FROM token_daily_stats WHERE user_id = ?',
    [userId],
    startDate,
    endDate
  )

  return query<DailyStat[]>(sql, params)
}

export async function getMonthlyStats(
  userId: number,
  year: number,
  month: number
): Promise<{ total_tokens: number; total_conversations: number; total_messages: number }> {
  const dateRange = buildMonthDateRange(year, month)

  const result = await queryOne<{
    total_tokens: number
    total_conversations: number
    total_messages: number
  }>(
    `SELECT 
      COALESCE(SUM(total_tokens), 0) as total_tokens,
      COALESCE(SUM(conversation_count), 0) as total_conversations,
      COALESCE(SUM(message_count), 0) as total_messages
    FROM token_daily_stats 
    WHERE user_id = ? AND date >= ? AND date <= ?`,
    [userId, dateRange.start, dateRange.end]
  )

  return result ?? { total_tokens: 0, total_conversations: 0, total_messages: 0 }
}

function buildMonthDateRange(year: number, month: number): { start: string; end: string } {
  const paddedMonth = String(month).padStart(2, '0')
  return {
    start: `${year}-${paddedMonth}-01`,
    end: `${year}-${paddedMonth}-31`
  }
}

export async function giveWelcomeBonus(userId: number): Promise<void> {
  const balance = await getOrCreateBalance(userId)

  if (isEligibleForWelcomeBonus(balance)) {
    await addTokens(
      userId,
      1000,
      'gift',
      '新用户注册赠送',
      'welcome_bonus',
      userId
    )
  }
}

function isEligibleForWelcomeBonus(balance: TokenBalance): boolean {
  return balance.total_purchased === 0 && balance.balance === 0
}
