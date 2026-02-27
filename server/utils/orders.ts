import { query, queryOne, insert } from './db'
import { addTokens } from './billing'

export interface Order {
  id: number
  order_no: string
  user_id: number
  total_amount: number
  total_tokens: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payment_method: string | null
  paid_at: Date | null
  cancelled_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface OrderItem {
  id: number
  order_id: number
  service_id: number
  service_name: string
  tokens: number
  price: number
  quantity: number
  subtotal: number
  created_at: Date
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}

export interface Payment {
  id: number
  order_id: number
  user_id: number
  payment_no: string
  method: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  transaction_id: string | null
  paid_at: Date | null
  created_at: Date
  updated_at: Date
}

interface OrderItemInput {
  serviceId: number
  serviceName: string
  tokens: number
  price: number
  quantity: number
}

interface OrderTotals {
  totalAmount: number
  totalTokens: number
}

const DEFAULT_ORDER_LIMIT = 10
const DEFAULT_ORDER_OFFSET = 0

function generatePrefixedId(prefix: string, suffixLength: number): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 2 + suffixLength).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

function generateOrderNo(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `TB${dateStr}${random}`
}

function generatePaymentNo(): string {
  return generatePrefixedId('PAY', 6)
}

function calculateOrderTotals(items: OrderItemInput[]): OrderTotals {
  return items.reduce(
    (totals, item) => ({
      totalAmount: totals.totalAmount + item.price * item.quantity,
      totalTokens: totals.totalTokens + item.tokens * item.quantity
    }),
    { totalAmount: 0, totalTokens: 0 }
  )
}

async function fetchOrderItems(orderId: number): Promise<OrderItem[]> {
  return query<OrderItem[]>('SELECT * FROM order_items WHERE order_id = ?', [orderId])
}

async function fetchOrderById(orderId: number): Promise<Order | null> {
  return queryOne<Order>('SELECT * FROM orders WHERE id = ?', [orderId])
}

async function fetchOrderByNo(orderNo: string): Promise<Order | null> {
  return queryOne<Order>('SELECT * FROM orders WHERE order_no = ?', [orderNo])
}

async function buildOrderWithItems(order: Order): Promise<OrderWithItems> {
  const items = await fetchOrderItems(order.id)
  return { ...order, items }
}

function canCancelOrder(order: Order | null): boolean {
  return order !== null && order.status === 'pending'
}

function canRefundOrder(order: OrderWithItems | null): boolean {
  return order !== null && order.status === 'paid'
}

function canCompletePayment(payment: Payment | null, order: OrderWithItems | null): boolean {
  if (!payment || payment.status !== 'pending') return false
  if (!order || order.status !== 'pending') return false
  return true
}

export async function createOrder(
  userId: number,
  items: OrderItemInput[]
): Promise<OrderWithItems> {
  const orderNo = generateOrderNo()
  const { totalAmount, totalTokens } = calculateOrderTotals(items)

  const orderResult = await insert('orders', {
    order_no: orderNo,
    user_id: userId,
    total_amount: totalAmount,
    total_tokens: totalTokens,
    status: 'pending'
  })

  const orderId = orderResult.insertId
  await createOrderItems(orderId, items)

  const order = await getOrderById(orderId)
  if (!order) {
    throw new Error('Failed to create order')
  }
  return order
}

async function createOrderItems(orderId: number, items: OrderItemInput[]): Promise<void> {
  for (const item of items) {
    await insert('order_items', {
      order_id: orderId,
      service_id: item.serviceId,
      service_name: item.serviceName,
      tokens: item.tokens,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    })
  }
}

export async function getOrderById(orderId: number): Promise<OrderWithItems | null> {
  const order = await fetchOrderById(orderId)
  if (!order) return null

  return buildOrderWithItems(order)
}

export async function getOrderByNo(orderNo: string): Promise<OrderWithItems | null> {
  const order = await fetchOrderByNo(orderNo)
  if (!order) return null

  return getOrderById(order.id)
}

export async function getUserOrders(
  userId: number,
  options?: { status?: string; limit?: number; offset?: number }
): Promise<OrderWithItems[]> {
  let sql = 'SELECT * FROM orders WHERE user_id = ?'
  const params: (string | number)[] = [userId]

  if (options?.status) {
    sql += ' AND status = ?'
    params.push(options.status)
  }

  sql += ' ORDER BY created_at DESC'

  const limit = options?.limit ?? DEFAULT_ORDER_LIMIT
  const offset = options?.offset ?? DEFAULT_ORDER_OFFSET
  sql += ` LIMIT ${limit} OFFSET ${offset}`

  const orders = await query<Order[]>(sql, params)
  const ordersWithItems = await Promise.all(
    orders.map(order => buildOrderWithItems(order))
  )
  return ordersWithItems
}

export async function getOrderCount(userId: number, status?: string): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM orders WHERE user_id = ?'
  const params: (string | number)[] = [userId]

  if (status) {
    sql += ' AND status = ?'
    params.push(status)
  }

  const result = await queryOne<{ count: number }>(sql, params)
  return result?.count ?? 0
}

export async function createPayment(
  orderId: number,
  userId: number,
  method: string,
  amount: number
): Promise<Payment> {
  const paymentNo = generatePaymentNo()

  const result = await insert('payments', {
    order_id: orderId,
    user_id: userId,
    payment_no: paymentNo,
    method,
    amount,
    status: 'pending'
  })

  return (await queryOne<Payment>('SELECT * FROM payments WHERE id = ?', [result.insertId]))!
}

export async function completePayment(
  paymentNo: string,
  transactionId: string
): Promise<{ success: boolean; order: OrderWithItems | null }> {
  const payment = await queryOne<Payment>(
    'SELECT * FROM payments WHERE payment_no = ?',
    [paymentNo]
  )

  const order = payment ? await getOrderById(payment.order_id) : null

  if (!canCompletePayment(payment, order)) {
    return { success: false, order: null }
  }

  await updatePaymentStatus(payment!, transactionId)
  await updateOrderStatus(order!, payment!.method)
  await creditTokensForOrder(order!)

  return { success: true, order: await getOrderById(order!.id) }
}

async function updatePaymentStatus(payment: Payment, transactionId: string): Promise<void> {
  await query(
    "UPDATE payments SET status = 'success', transaction_id = ?, paid_at = NOW() WHERE id = ?",
    [transactionId, payment.id]
  )
}

async function updateOrderStatus(order: OrderWithItems, paymentMethod: string): Promise<void> {
  await query(
    "UPDATE orders SET status = 'paid', payment_method = ?, paid_at = NOW() WHERE id = ?",
    [paymentMethod, order.id]
  )
}

async function creditTokensForOrder(order: OrderWithItems): Promise<void> {
  const serviceNames = order.items.map((item) => item.service_name).join('、')
  await addTokens(
    order.user_id,
    order.total_tokens,
    'purchase',
    `购买套餐：${serviceNames}`,
    'order',
    order.id
  )
  
  const pointsEarned = Math.floor(order.total_amount)
  if (pointsEarned > 0) {
    const { addPoints } = await import('./membership')
    await addPoints(
      order.user_id,
      pointsEarned,
      'earn',
      `购买套餐获得积分：${serviceNames}`,
      'order',
      order.id
    )
  }
  
  await query(
    'UPDATE users SET total_recharged = total_recharged + ? WHERE id = ?',
    [order.total_amount, order.user_id]
  )
}

export async function cancelOrder(orderId: number, userId: number): Promise<boolean> {
  const order = await queryOne<Order>(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [orderId, userId]
  )

  if (!canCancelOrder(order)) {
    return false
  }

  await query(
    "UPDATE orders SET status = 'cancelled', cancelled_at = NOW() WHERE id = ?",
    [orderId]
  )

  return true
}

export async function refundOrder(
  orderId: number
): Promise<{ success: boolean; message: string }> {
  const order = await getOrderById(orderId)

  if (!order) {
    return { success: false, message: '订单不存在' }
  }

  if (!canRefundOrder(order)) {
    return { success: false, message: '订单状态不允许退款' }
  }

  await markOrderAsRefunded(orderId)
  await refundTokensForOrder(order)

  return { success: true, message: '退款成功' }
}

async function markOrderAsRefunded(orderId: number): Promise<void> {
  await query("UPDATE orders SET status = 'refunded' WHERE id = ?", [orderId])
}

async function refundTokensForOrder(order: OrderWithItems): Promise<void> {
  await addTokens(
    order.user_id,
    -order.total_tokens,
    'refund',
    `订单退款：${order.order_no}`,
    'order',
    order.id
  )
}

export async function getPayment(paymentNo: string): Promise<Payment | null> {
  return queryOne<Payment>('SELECT * FROM payments WHERE payment_no = ?', [paymentNo])
}
