import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../utils/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  insert: vi.fn()
}))

const { query, queryOne, insert } = await import('../utils/db')

vi.stubGlobal('createError', (opts: { statusCode: number; message: string }) => {
  const error = new Error(opts.message)
  ;(error as unknown as { statusCode: number }).statusCode = opts.statusCode
  return error
})

describe('Billing Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getOrCreateBalance', () => {
    it('should return existing balance if found', async () => {
      const mockBalance = {
        id: 1,
        user_id: 123,
        balance: 1000,
        total_purchased: 2000,
        total_consumed: 1000,
        created_at: new Date(),
        updated_at: new Date()
      }

      vi.mocked(queryOne).mockResolvedValueOnce(mockBalance)

      const { getOrCreateBalance } = await import('../utils/billing')
      const result = await getOrCreateBalance(123)

      expect(result).toEqual(mockBalance)
      expect(queryOne).toHaveBeenCalledWith(
        'SELECT * FROM token_balances WHERE user_id = ?',
        [123]
      )
    })

    it('should create new balance if not found', async () => {
      const initialBalance = {
        id: 1,
        user_id: 456,
        balance: 0,
        total_purchased: 0,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
      const afterBonusBalance = {
        id: 1,
        user_id: 456,
        balance: 10000,
        total_purchased: 10000,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      }

      let callCount = 0
      vi.mocked(queryOne).mockImplementation(async () => {
        callCount++
        if (callCount === 1) return null
        if (callCount <= 3) return initialBalance
        return afterBonusBalance
      })

      vi.mocked(insert).mockResolvedValue({ insertId: 1, affectedRows: 1 })
      vi.mocked(query).mockResolvedValue({ affectedRows: 1 })

      const { getOrCreateBalance } = await import('../utils/billing')
      const result = await getOrCreateBalance(456)

      expect(result.balance).toBe(10000)
      expect(insert).toHaveBeenCalledWith('token_balances', {
        user_id: 456,
        balance: 0,
        total_purchased: 0,
        total_consumed: 0
      })
    })
  })

  describe('getBalance', () => {
    it('should return balance value', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 500,
        total_purchased: 1000,
        total_consumed: 500,
        created_at: new Date(),
        updated_at: new Date()
      })

      const { getBalance } = await import('../utils/billing')
      const result = await getBalance(123)

      expect(result).toBe(500)
    })

    it('should return welcome bonus for new user', async () => {
      const initialBalance = {
        id: 1,
        user_id: 789,
        balance: 0,
        total_purchased: 0,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      }
      const afterBonusBalance = {
        id: 1,
        user_id: 789,
        balance: 10000,
        total_purchased: 10000,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      }

      let callCount = 0
      vi.mocked(queryOne).mockImplementation(async () => {
        callCount++
        if (callCount === 1) return null
        if (callCount <= 3) return initialBalance
        return afterBonusBalance
      })

      vi.mocked(insert).mockResolvedValue({ insertId: 1, affectedRows: 1 })
      vi.mocked(query).mockResolvedValue({ affectedRows: 1 })

      const { getBalance } = await import('../utils/billing')
      const result = await getBalance(789)

      expect(result).toBe(10000)
    })
  })

  describe('addTokens', () => {
    it('should add tokens with purchase type', async () => {
      vi.mocked(queryOne)
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 100,
          total_purchased: 100,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 600,
          total_purchased: 600,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { addTokens } = await import('../utils/billing')
      const result = await addTokens(123, 500, 'purchase', 'Purchase 500 tokens')

      expect(result.balance).toBe(600)
      expect(result.total_purchased).toBe(600)
    })

    it('should add tokens with gift type and update total_purchased', async () => {
      vi.mocked(queryOne)
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 0,
          total_purchased: 0,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 1000,
          total_purchased: 1000,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { addTokens } = await import('../utils/billing')
      const result = await addTokens(123, 1000, 'gift', 'Welcome bonus')

      expect(result.balance).toBe(1000)
      expect(result.total_purchased).toBe(1000)
    })

    it('should add tokens with refund type without updating total_purchased', async () => {
      vi.mocked(queryOne)
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 50,
          total_purchased: 200,
          total_consumed: 150,
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 100,
          total_purchased: 200,
          total_consumed: 150,
          created_at: new Date(),
          updated_at: new Date()
        })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { addTokens } = await import('../utils/billing')
      const result = await addTokens(123, 50, 'refund', 'Refund for cancelled order')

      expect(result.balance).toBe(100)
      expect(result.total_purchased).toBe(200)
    })

    it('should include reference type and id in transaction', async () => {
      vi.mocked(queryOne)
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 0,
          total_purchased: 0,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 100,
          total_purchased: 100,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { addTokens } = await import('../utils/billing')
      await addTokens(123, 100, 'purchase', 'Test', 'order', 456)

      expect(insert).toHaveBeenCalledWith('token_transactions', {
        user_id: 123,
        type: 'purchase',
        amount: 100,
        balance_after: 100,
        description: 'Test',
        reference_type: 'order',
        reference_id: 456
      })
    })

    it('should handle null description and reference', async () => {
      vi.mocked(queryOne)
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 0,
          total_purchased: 0,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 100,
          total_purchased: 100,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { addTokens } = await import('../utils/billing')
      await addTokens(123, 100, 'gift')

      expect(insert).toHaveBeenCalledWith('token_transactions', expect.objectContaining({
        description: null,
        reference_type: null,
        reference_id: null
      }))
    })
  })

  describe('consumeTokens', () => {
    it('should consume tokens successfully', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 1000,
        total_purchased: 1000,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { consumeTokens } = await import('../utils/billing')
      const result = await consumeTokens(123, 100, 'Chat message')

      expect(result).toBe(true)
    })

    it('should return false when insufficient balance', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 50,
        total_purchased: 100,
        total_consumed: 50,
        created_at: new Date(),
        updated_at: new Date()
      })

      const { consumeTokens } = await import('../utils/billing')
      const result = await consumeTokens(123, 100, 'Chat message')

      expect(result).toBe(false)
      expect(query).not.toHaveBeenCalled()
    })

    it('should return false when balance equals consumption amount', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 100,
        total_purchased: 100,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { consumeTokens } = await import('../utils/billing')
      const result = await consumeTokens(123, 100)

      expect(result).toBe(true)
    })

    it('should record negative amount in transaction', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 500,
        total_purchased: 500,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { consumeTokens } = await import('../utils/billing')
      await consumeTokens(123, 50, 'Test', 'chat', 1)

      expect(insert).toHaveBeenCalledWith('token_transactions', expect.objectContaining({
        type: 'consume',
        amount: -50,
        balance_after: 450
      }))
    })

    it('should update total_consumed', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 500,
        total_purchased: 500,
        total_consumed: 100,
        created_at: new Date(),
        updated_at: new Date()
      })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { consumeTokens } = await import('../utils/billing')
      await consumeTokens(123, 50)

      expect(query).toHaveBeenCalledWith(
        'UPDATE token_balances SET balance = ?, total_consumed = ? WHERE user_id = ?',
        [450, 150, 123]
      )
    })
  })

  describe('getTransactions', () => {
    it('should return transactions with default limit', async () => {
      const mockTransactions = [
        { id: 1, user_id: 123, type: 'purchase', amount: 100, balance_after: 100, description: null, reference_type: null, reference_id: null, created_at: new Date() },
        { id: 2, user_id: 123, type: 'consume', amount: -50, balance_after: 50, description: 'Chat', reference_type: null, reference_id: null, created_at: new Date() }
      ]

      vi.mocked(query).mockResolvedValueOnce(mockTransactions)

      const { getTransactions } = await import('../utils/billing')
      const result = await getTransactions(123)

      expect(result).toEqual(mockTransactions)
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 20 OFFSET 0'),
        [123]
      )
    })

    it('should filter by type when provided', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getTransactions } = await import('../utils/billing')
      await getTransactions(123, { type: 'purchase' })

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND type = ?'),
        [123, 'purchase']
      )
    })

    it('should use custom limit and offset', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getTransactions } = await import('../utils/billing')
      await getTransactions(123, { limit: 10, offset: 5 })

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 10 OFFSET 5'),
        [123]
      )
    })

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getTransactions } = await import('../utils/billing')
      await getTransactions(123)

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        [123]
      )
    })
  })

  describe('getTransactionCount', () => {
    it('should return count of all transactions', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ count: 42 })

      const { getTransactionCount } = await import('../utils/billing')
      const result = await getTransactionCount(123)

      expect(result).toBe(42)
    })

    it('should return 0 when no transactions', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null)

      const { getTransactionCount } = await import('../utils/billing')
      const result = await getTransactionCount(123)

      expect(result).toBe(0)
    })

    it('should filter by type when provided', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ count: 10 })

      const { getTransactionCount } = await import('../utils/billing')
      await getTransactionCount(123, 'purchase')

      expect(queryOne).toHaveBeenCalledWith(
        expect.stringContaining('AND type = ?'),
        [123, 'purchase']
      )
    })
  })

  describe('recordDailyConsumption', () => {
    it('should insert new daily stat record', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null)
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { recordDailyConsumption } = await import('../utils/billing')
      await recordDailyConsumption(123, 100, 5)

      expect(insert).toHaveBeenCalledWith('token_daily_stats', expect.objectContaining({
        user_id: 123,
        total_tokens: 100,
        conversation_count: 1,
        message_count: 5
      }))
    })

    it('should update existing daily stat record', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ id: 1 })
      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })

      const { recordDailyConsumption } = await import('../utils/billing')
      await recordDailyConsumption(123, 50, 3)

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE token_daily_stats'),
        [50, 3, 1]
      )
    })

    it('should use default message count of 1', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null)
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { recordDailyConsumption } = await import('../utils/billing')
      await recordDailyConsumption(123, 100)

      expect(insert).toHaveBeenCalledWith('token_daily_stats', expect.objectContaining({
        message_count: 1
      }))
    })
  })

  describe('getDailyStats', () => {
    it('should return daily stats without date filter', async () => {
      const mockStats = [
        { date: '2024-01-15', total_tokens: 100, conversation_count: 5, message_count: 10 },
        { date: '2024-01-14', total_tokens: 200, conversation_count: 8, message_count: 15 }
      ]

      vi.mocked(query).mockResolvedValueOnce(mockStats)

      const { getDailyStats } = await import('../utils/billing')
      const result = await getDailyStats(123)

      expect(result).toEqual(mockStats)
    })

    it('should filter by start date', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getDailyStats } = await import('../utils/billing')
      await getDailyStats(123, '2024-01-01')

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND date >= ?'),
        [123, '2024-01-01']
      )
    })

    it('should filter by end date', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getDailyStats } = await import('../utils/billing')
      await getDailyStats(123, undefined, '2024-01-31')

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('AND date <= ?'),
        [123, '2024-01-31']
      )
    })

    it('should filter by both start and end date', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getDailyStats } = await import('../utils/billing')
      await getDailyStats(123, '2024-01-01', '2024-01-31')

      const callArgs = vi.mocked(query).mock.calls[0]
      expect(callArgs[0]).toContain('AND date >= ?')
      expect(callArgs[0]).toContain('AND date <= ?')
      expect(callArgs[1]).toEqual([123, '2024-01-01', '2024-01-31'])
    })

    it('should limit to 90 results', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getDailyStats } = await import('../utils/billing')
      await getDailyStats(123)

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 90'),
        [123]
      )
    })
  })

  describe('getMonthlyStats', () => {
    it('should return aggregated monthly stats', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        total_tokens: 3000,
        total_conversations: 100,
        total_messages: 500
      })

      const { getMonthlyStats } = await import('../utils/billing')
      const result = await getMonthlyStats(123, 2024, 1)

      expect(result).toEqual({
        total_tokens: 3000,
        total_conversations: 100,
        total_messages: 500
      })
    })

    it('should return zeros when no data', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null)

      const { getMonthlyStats } = await import('../utils/billing')
      const result = await getMonthlyStats(123, 2024, 1)

      expect(result).toEqual({
        total_tokens: 0,
        total_conversations: 0,
        total_messages: 0
      })
    })

    it('should use correct date range for month', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ total_tokens: 0, total_conversations: 0, total_messages: 0 })

      const { getMonthlyStats } = await import('../utils/billing')
      await getMonthlyStats(123, 2024, 6)

      expect(queryOne).toHaveBeenCalledWith(
        expect.any(String),
        [123, '2024-06-01', '2024-06-31']
      )
    })

    it('should pad month with leading zero', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({ total_tokens: 0, total_conversations: 0, total_messages: 0 })

      const { getMonthlyStats } = await import('../utils/billing')
      await getMonthlyStats(123, 2024, 3)

      expect(queryOne).toHaveBeenCalledWith(
        expect.any(String),
        [123, '2024-03-01', '2024-03-31']
      )
    })
  })

  describe('giveWelcomeBonus', () => {
    it('should give welcome bonus to new user', async () => {
      vi.mocked(queryOne)
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 0,
          total_purchased: 0,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 1,
          user_id: 123,
          balance: 1000,
          total_purchased: 1000,
          total_consumed: 0,
          created_at: new Date(),
          updated_at: new Date()
        })

      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })

      const { giveWelcomeBonus } = await import('../utils/billing')
      await giveWelcomeBonus(123)

      expect(insert).toHaveBeenCalledWith('token_transactions', expect.objectContaining({
        type: 'gift',
        amount: 10000,
        description: '新用户注册赠送',
        reference_type: 'welcome_bonus',
        reference_id: 123
      }))
    })

    it('should not give bonus if user already has balance', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 500,
        total_purchased: 0,
        total_consumed: 0,
        created_at: new Date(),
        updated_at: new Date()
      })

      const { giveWelcomeBonus } = await import('../utils/billing')
      await giveWelcomeBonus(123)

      expect(insert).not.toHaveBeenCalled()
    })

    it('should not give bonus if user already purchased tokens', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce({
        id: 1,
        user_id: 123,
        balance: 0,
        total_purchased: 100,
        total_consumed: 100,
        created_at: new Date(),
        updated_at: new Date()
      })

      const { giveWelcomeBonus } = await import('../utils/billing')
      await giveWelcomeBonus(123)

      expect(insert).not.toHaveBeenCalled()
    })
  })
})
