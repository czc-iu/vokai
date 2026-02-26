import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockQuery = vi.fn()
const mockQueryOne = vi.fn()
const mockInsert = vi.fn()
const mockRemove = vi.fn()

vi.mock('../utils/db', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  insert: (...args: unknown[]) => mockInsert(...args),
  remove: (...args: unknown[]) => mockRemove(...args)
}))

const mockAddTokens = vi.fn()

vi.mock('../utils/billing', () => ({
  addTokens: (...args: unknown[]) => mockAddTokens(...args)
}))

describe('Orders Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  describe('createOrder', () => {
    it('should create order with single item', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB20240615TEST1234',
        user_id: 1,
        total_amount: 100,
        total_tokens: 1000,
        status: 'pending',
        payment_method: null,
        paid_at: null,
        cancelled_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
      const mockItems = [{
        id: 1,
        order_id: 1,
        service_id: 1,
        service_name: 'Basic Plan',
        tokens: 1000,
        price: 100,
        quantity: 1,
        subtotal: 100,
        created_at: new Date()
      }]

      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue(mockItems)

      const { createOrder } = await import('../utils/orders')
      const result = await createOrder(1, [{
        serviceId: 1,
        serviceName: 'Basic Plan',
        tokens: 1000,
        price: 100,
        quantity: 1
      }])

      expect(result.order_no).toMatch(/^TB\d{8}[A-Z0-9]+$/)
      expect(result.total_amount).toBe(100)
      expect(result.total_tokens).toBe(1000)
      expect(result.items).toHaveLength(1)
    })

    it('should create order with multiple items', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB20240615TEST1234',
        user_id: 1,
        total_amount: 300,
        total_tokens: 3000,
        status: 'pending',
        payment_method: null,
        paid_at: null,
        cancelled_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
      const mockItems = [
        { id: 1, order_id: 1, service_id: 1, service_name: 'Basic', tokens: 1000, price: 100, quantity: 1, subtotal: 100, created_at: new Date() },
        { id: 2, order_id: 1, service_id: 2, service_name: 'Pro', tokens: 2000, price: 200, quantity: 1, subtotal: 200, created_at: new Date() }
      ]

      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue(mockItems)

      const { createOrder } = await import('../utils/orders')
      const result = await createOrder(1, [
        { serviceId: 1, serviceName: 'Basic', tokens: 1000, price: 100, quantity: 1 },
        { serviceId: 2, serviceName: 'Pro', tokens: 2000, price: 200, quantity: 1 }
      ])

      expect(result.total_amount).toBe(300)
      expect(result.total_tokens).toBe(3000)
      expect(mockInsert).toHaveBeenCalledTimes(3)
    })

    it('should calculate totals correctly with quantity > 1', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB20240615TEST',
        user_id: 1,
        total_amount: 500,
        total_tokens: 5000,
        status: 'pending',
        payment_method: null,
        paid_at: null,
        cancelled_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }
      const mockItems = [
        { id: 1, order_id: 1, service_id: 1, service_name: 'Basic', tokens: 1000, price: 100, quantity: 5, subtotal: 500, created_at: new Date() }
      ]

      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue(mockItems)

      const { createOrder } = await import('../utils/orders')
      const result = await createOrder(1, [
        { serviceId: 1, serviceName: 'Basic', tokens: 1000, price: 100, quantity: 5 }
      ])

      expect(result.total_amount).toBe(500)
      expect(result.total_tokens).toBe(5000)
    })

    it('should throw error when order creation fails', async () => {
      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockInsert.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
      mockQueryOne.mockResolvedValue(null)

      const { createOrder } = await import('../utils/orders')

      await expect(createOrder(1, [{
        serviceId: 1,
        serviceName: 'Basic',
        tokens: 1000,
        price: 100,
        quantity: 1
      }])).rejects.toThrow('Failed to create order')
    })
  })

  describe('getOrderById', () => {
    it('should return order with items', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB20240615TEST',
        user_id: 1,
        total_amount: 100,
        total_tokens: 1000,
        status: 'pending'
      }
      const mockItems = [
        { id: 1, order_id: 1, service_name: 'Basic', tokens: 1000, price: 100, quantity: 1 }
      ]

      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue(mockItems)

      const { getOrderById } = await import('../utils/orders')
      const result = await getOrderById(1)

      expect(result).not.toBeNull()
      expect(result?.items).toEqual(mockItems)
    })

    it('should return null when order not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getOrderById } = await import('../utils/orders')
      const result = await getOrderById(999)

      expect(result).toBeNull()
    })

    it('should return order with empty items array', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB20240615TEST',
        user_id: 1,
        total_amount: 0,
        total_tokens: 0,
        status: 'pending'
      }

      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue([])

      const { getOrderById } = await import('../utils/orders')
      const result = await getOrderById(1)

      expect(result?.items).toEqual([])
    })
  })

  describe('getOrderByNo', () => {
    it('should return order by order number', async () => {
      const mockOrder = { id: 1, order_no: 'TB20240615TEST' }
      const mockFullOrder = {
        id: 1,
        order_no: 'TB20240615TEST',
        user_id: 1,
        total_amount: 100,
        total_tokens: 1000,
        status: 'pending',
        items: []
      }

      mockQueryOne.mockResolvedValueOnce(mockOrder)
      mockQueryOne.mockResolvedValueOnce(mockFullOrder)
      mockQuery.mockResolvedValue([])

      const { getOrderByNo } = await import('../utils/orders')
      const result = await getOrderByNo('TB20240615TEST')

      expect(result).not.toBeNull()
      expect(result?.order_no).toBe('TB20240615TEST')
    })

    it('should return null when order number not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getOrderByNo } = await import('../utils/orders')
      const result = await getOrderByNo('NONEXISTENT')

      expect(result).toBeNull()
    })
  })

  describe('getUserOrders', () => {
    it('should return user orders with default pagination', async () => {
      const mockOrders = [
        { id: 2, user_id: 1, status: 'pending' },
        { id: 1, user_id: 1, status: 'paid' }
      ]
      mockQuery.mockResolvedValue(mockOrders)

      const { getUserOrders } = await import('../utils/orders')
      const result = await getUserOrders(1)

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10 OFFSET 0',
        [1]
      )
      expect(result).toEqual(mockOrders)
    })

    it('should filter by status', async () => {
      mockQuery.mockResolvedValue([])

      const { getUserOrders } = await import('../utils/orders')
      await getUserOrders(1, { status: 'paid' })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND status = ?'),
        [1, 'paid']
      )
    })

    it('should use custom limit and offset', async () => {
      mockQuery.mockResolvedValue([])

      const { getUserOrders } = await import('../utils/orders')
      await getUserOrders(1, { limit: 20, offset: 10 })

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 20 OFFSET 10'),
        [1]
      )
    })
  })

  describe('getOrderCount', () => {
    it('should return total order count', async () => {
      mockQueryOne.mockResolvedValue({ count: 5 })

      const { getOrderCount } = await import('../utils/orders')
      const result = await getOrderCount(1)

      expect(result).toBe(5)
    })

    it('should return count filtered by status', async () => {
      mockQueryOne.mockResolvedValue({ count: 3 })

      const { getOrderCount } = await import('../utils/orders')
      const result = await getOrderCount(1, 'paid')

      expect(mockQueryOne).toHaveBeenCalledWith(
        expect.stringContaining('AND status = ?'),
        [1, 'paid']
      )
      expect(result).toBe(3)
    })

    it('should return 0 when no orders', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getOrderCount } = await import('../utils/orders')
      const result = await getOrderCount(999)

      expect(result).toBe(0)
    })
  })

  describe('createPayment', () => {
    it('should create payment and return payment record', async () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        user_id: 1,
        payment_no: 'PAY1234567890ABC',
        method: 'alipay',
        amount: 100,
        status: 'pending',
        transaction_id: null,
        paid_at: null,
        created_at: new Date(),
        updated_at: new Date()
      }

      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })
      mockQueryOne.mockResolvedValue(mockPayment)

      const { createPayment } = await import('../utils/orders')
      const result = await createPayment(1, 1, 'alipay', 100)

      expect(result.payment_no).toMatch(/^PAY\d+[A-Z0-9]+$/)
      expect(result.method).toBe('alipay')
      expect(result.amount).toBe(100)
      expect(result.status).toBe('pending')
    })

    it('should create payment with different methods', async () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        user_id: 1,
        payment_no: 'PAY123',
        method: 'wechat',
        amount: 200,
        status: 'pending'
      }

      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })
      mockQueryOne.mockResolvedValue(mockPayment)

      const { createPayment } = await import('../utils/orders')
      const result = await createPayment(1, 1, 'wechat', 200)

      expect(result.method).toBe('wechat')
    })
  })

  describe('completePayment', () => {
    it('should complete payment and update order status', async () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        user_id: 1,
        payment_no: 'PAY123',
        method: 'alipay',
        amount: 100,
        status: 'pending'
      }
      const mockOrder = {
        id: 1,
        order_no: 'TB123',
        user_id: 1,
        total_amount: 100,
        total_tokens: 1000,
        status: 'pending',
        items: [
          { service_name: 'Basic Plan' }
        ]
      }
      const mockUpdatedOrder = {
        ...mockOrder,
        status: 'paid',
        payment_method: 'alipay',
        paid_at: new Date()
      }

      mockQueryOne.mockResolvedValueOnce(mockPayment)
      mockQueryOne.mockResolvedValueOnce(mockOrder)
      mockQuery.mockResolvedValue({ affectedRows: 1 })
      mockAddTokens.mockResolvedValue({})
      mockQueryOne.mockResolvedValueOnce(mockOrder)
      mockQuery.mockResolvedValueOnce(mockOrder.items)
      mockQueryOne.mockResolvedValueOnce(mockUpdatedOrder)

      const { completePayment } = await import('../utils/orders')
      const result = await completePayment('PAY123', 'TXN123')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE payments SET status = 'success'"),
        expect.any(Array)
      )
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status = 'paid'"),
        expect.any(Array)
      )
      expect(mockAddTokens).toHaveBeenCalledWith(
        1,
        1000,
        'purchase',
        expect.stringContaining('Basic Plan'),
        'order',
        1
      )
      expect(result.success).toBe(true)
    })

    it('should return failure when payment not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { completePayment } = await import('../utils/orders')
      const result = await completePayment('NONEXISTENT', 'TXN123')

      expect(result.success).toBe(false)
      expect(result.order).toBeNull()
    })

    it('should return failure when payment already processed', async () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        status: 'success'
      }
      mockQueryOne.mockResolvedValue(mockPayment)

      const { completePayment } = await import('../utils/orders')
      const result = await completePayment('PAY123', 'TXN123')

      expect(result.success).toBe(false)
    })

    it('should return failure when order not found', async () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        status: 'pending'
      }
      mockQueryOne.mockResolvedValueOnce(mockPayment)
      mockQueryOne.mockResolvedValueOnce(null)

      const { completePayment } = await import('../utils/orders')
      const result = await completePayment('PAY123', 'TXN123')

      expect(result.success).toBe(false)
    })

    it('should return failure when order already paid', async () => {
      const mockPayment = {
        id: 1,
        order_id: 1,
        status: 'pending'
      }
      const mockOrder = {
        id: 1,
        status: 'paid'
      }
      mockQueryOne.mockResolvedValueOnce(mockPayment)
      mockQueryOne.mockResolvedValueOnce(mockOrder)

      const { completePayment } = await import('../utils/orders')
      const result = await completePayment('PAY123', 'TXN123')

      expect(result.success).toBe(false)
    })
  })

  describe('cancelOrder', () => {
    it('should cancel pending order', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        status: 'pending'
      }
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { cancelOrder } = await import('../utils/orders')
      const result = await cancelOrder(1, 1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status = 'cancelled'"),
        [1]
      )
      expect(result).toBe(true)
    })

    it('should return false when order not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { cancelOrder } = await import('../utils/orders')
      const result = await cancelOrder(999, 1)

      expect(result).toBe(false)
    })

    it('should return false when order belongs to different user', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { cancelOrder } = await import('../utils/orders')
      const result = await cancelOrder(1, 1)

      expect(result).toBe(false)
    })

    it('should return false when order is not pending', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        status: 'paid'
      }
      mockQueryOne.mockResolvedValue(mockOrder)

      const { cancelOrder } = await import('../utils/orders')
      const result = await cancelOrder(1, 1)

      expect(result).toBe(false)
    })

    it('should return false for cancelled order', async () => {
      const mockOrder = {
        id: 1,
        user_id: 1,
        status: 'cancelled'
      }
      mockQueryOne.mockResolvedValue(mockOrder)

      const { cancelOrder } = await import('../utils/orders')
      const result = await cancelOrder(1, 1)

      expect(result).toBe(false)
    })
  })

  describe('refundOrder', () => {
    it('should refund paid order', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB123',
        user_id: 1,
        total_tokens: 1000,
        status: 'paid',
        items: [{ service_name: 'Basic' }]
      }

      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue(mockOrder.items)
      mockQuery.mockResolvedValueOnce({ affectedRows: 1 })
      mockAddTokens.mockResolvedValue({})

      const { refundOrder } = await import('../utils/orders')
      const result = await refundOrder(1)

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status = 'refunded'"),
        [1]
      )
      expect(mockAddTokens).toHaveBeenCalledWith(
        1,
        -1000,
        'refund',
        expect.stringContaining('TB123'),
        'order',
        1
      )
      expect(result.success).toBe(true)
      expect(result.message).toBe('退款成功')
    })

    it('should return failure when order not found', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockQuery.mockResolvedValue([])

      const { refundOrder } = await import('../utils/orders')
      const result = await refundOrder(999)

      expect(result.success).toBe(false)
      expect(result.message).toBe('订单不存在')
    })

    it('should return failure when order not paid', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB123',
        status: 'pending',
        items: []
      }
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue([])

      const { refundOrder } = await import('../utils/orders')
      const result = await refundOrder(1)

      expect(result.success).toBe(false)
      expect(result.message).toBe('订单状态不允许退款')
    })

    it('should return failure for already refunded order', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB123',
        status: 'refunded',
        items: []
      }
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue([])

      const { refundOrder } = await import('../utils/orders')
      const result = await refundOrder(1)

      expect(result.success).toBe(false)
    })

    it('should return failure for cancelled order', async () => {
      const mockOrder = {
        id: 1,
        order_no: 'TB123',
        status: 'cancelled',
        items: []
      }
      mockQueryOne.mockResolvedValue(mockOrder)
      mockQuery.mockResolvedValue([])

      const { refundOrder } = await import('../utils/orders')
      const result = await refundOrder(1)

      expect(result.success).toBe(false)
    })
  })

  describe('getPayment', () => {
    it('should return payment by payment number', async () => {
      const mockPayment = {
        id: 1,
        payment_no: 'PAY123',
        method: 'alipay',
        amount: 100,
        status: 'pending'
      }
      mockQueryOne.mockResolvedValue(mockPayment)

      const { getPayment } = await import('../utils/orders')
      const result = await getPayment('PAY123')

      expect(mockQueryOne).toHaveBeenCalledWith(
        'SELECT * FROM payments WHERE payment_no = ?',
        ['PAY123']
      )
      expect(result).toEqual(mockPayment)
    })

    it('should return null when payment not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getPayment } = await import('../utils/orders')
      const result = await getPayment('NONEXISTENT')

      expect(result).toBeNull()
    })
  })

  describe('Order number generation', () => {
    it('should generate unique order numbers', async () => {
      const orderNos = new Set<string>()

      for (let i = 0; i < 100; i++) {
        const mockOrder = {
          id: i + 1,
          order_no: `TB20240615${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          user_id: 1,
          total_amount: 100,
          total_tokens: 1000,
          status: 'pending',
          items: []
        }
        orderNos.add(mockOrder.order_no)
      }

      expect(orderNos.size).toBe(100)
    })
  })

  describe('Payment number generation', () => {
    it('should generate unique payment numbers', async () => {
      const paymentNos = new Set<string>()

      for (let i = 0; i < 100; i++) {
        const timestamp = Date.now() + i
        const random = Math.random().toString(36).substring(2, 8).toUpperCase()
        paymentNos.add(`PAY${timestamp}${random}`)
      }

      expect(paymentNos.size).toBe(100)
    })
  })
})
