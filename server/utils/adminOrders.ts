import { query, queryOne, update } from './db'
import { addTokens } from './billing'

export interface AdminOrder {
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
  user_email?: string
  user_name?: string
}

export interface AdminOrderWithItems extends AdminOrder {
  items: {
    id: number
    service_id: number
    service_name: string
    tokens: number
    price: number
    quantity: number
    subtotal: number
  }[]
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
}

interface OrderListOptions {
  search?: string
  status?: string
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

export async function getOrdersAdmin(options: OrderListOptions = {}): Promise<AdminOrder[]> {
  let sql = `
    SELECT o.*, u.email as user_email, u.name as user_name
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options.search) {
    sql += ` AND (o.order_no LIKE ? OR u.email LIKE ? OR u.name LIKE ?)`
    const searchPattern = `%${options.search}%`
    params.push(searchPattern, searchPattern, searchPattern)
  }

  if (options.status) {
    sql += ` AND o.status = ?`
    params.push(options.status)
  }

  if (options.userId) {
    sql += ` AND o.user_id = ?`
    params.push(options.userId)
  }

  if (options.startDate) {
    sql += ` AND DATE(o.created_at) >= ?`
    params.push(options.startDate)
  }

  if (options.endDate) {
    sql += ` AND DATE(o.created_at) <= ?`
    params.push(options.endDate)
  }

  const sortBy = options.sortBy || 'created_at'
  const sortOrder = options.sortOrder || 'desc'
  sql += ` ORDER BY o.${sortBy} ${sortOrder}`

  const limit = options.limit ?? DEFAULT_LIMIT
  const offset = options.offset ?? DEFAULT_OFFSET
  sql += ` LIMIT ${limit} OFFSET ${offset}`

  return query<AdminOrder[]>(sql, params)
}

export async function getOrdersCount(options: OrderListOptions = {}): Promise<number> {
  let sql = `
    SELECT COUNT(*) as count 
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `
  const params: (string | number)[] = []

  if (options.search) {
    sql += ` AND (o.order_no LIKE ? OR u.email LIKE ? OR u.name LIKE ?)`
    const searchPattern = `%${options.search}%`
    params.push(searchPattern, searchPattern, searchPattern)
  }

  if (options.status) {
    sql += ` AND o.status = ?`
    params.push(options.status)
  }

  if (options.userId) {
    sql += ` AND o.user_id = ?`
    params.push(options.userId)
  }

  if (options.startDate) {
    sql += ` AND DATE(o.created_at) >= ?`
    params.push(options.startDate)
  }

  if (options.endDate) {
    sql += ` AND DATE(o.created_at) <= ?`
    params.push(options.endDate)
  }

  const result = await queryOne<{ count: number }>(sql, params)
  return result?.count ?? 0
}

export async function getOrderAdmin(orderId: number): Promise<AdminOrderWithItems | null> {
  const order = await queryOne<AdminOrder>(
    `SELECT o.*, u.email as user_email, u.name as user_name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     WHERE o.id = ?`,
    [orderId]
  )

  if (!order) return null

  const items = await query<{
    id: number
    service_id: number
    service_name: string
    tokens: number
    price: number
    quantity: number
    subtotal: number
  }[]>('SELECT * FROM order_items WHERE order_id = ?', [orderId])

  return { ...order, items }
}

export async function updateOrderStatusAdmin(
  orderId: number,
  status: 'pending' | 'paid' | 'cancelled' | 'refunded',
  paymentMethod?: string
): Promise<boolean> {
  const updateData: Record<string, unknown> = { status }

  if (status === 'paid') {
    updateData.paid_at = new Date()
    if (paymentMethod) {
      updateData.payment_method = paymentMethod
    }
  }

  if (status === 'cancelled') {
    updateData.cancelled_at = new Date()
  }

  const result = await update('orders', updateData, 'id = ?', [orderId])
  return result.affectedRows > 0
}

export async function confirmOrderPayment(orderId: number, paymentMethod: string): Promise<{ success: boolean; message: string }> {
  const order = await getOrderAdmin(orderId)

  if (!order) {
    return { success: false, message: '订单不存在' }
  }

  if (order.status !== 'pending') {
    return { success: false, message: '订单状态不允许确认付款' }
  }

  await updateOrderStatusAdmin(orderId, 'paid', paymentMethod)

  const serviceNames = order.items.map(item => item.service_name).join('、')
  await addTokens(
    order.user_id,
    order.total_tokens,
    'purchase',
    `购买套餐：${serviceNames}`,
    'order',
    orderId
  )

  return { success: true, message: '付款确认成功' }
}

export async function refundOrderAdmin(orderId: number): Promise<{ success: boolean; message: string }> {
  const order = await getOrderAdmin(orderId)

  if (!order) {
    return { success: false, message: '订单不存在' }
  }

  if (order.status !== 'paid') {
    return { success: false, message: '订单状态不允许退款' }
  }

  await updateOrderStatusAdmin(orderId, 'refunded')

  await addTokens(
    order.user_id,
    -order.total_tokens,
    'refund',
    `订单退款：${order.order_no}`,
    'order',
    orderId
  )

  return { success: true, message: '退款成功' }
}

export async function cancelOrderAdmin(orderId: number): Promise<{ success: boolean; message: string }> {
  const order = await getOrderAdmin(orderId)

  if (!order) {
    return { success: false, message: '订单不存在' }
  }

  if (order.status !== 'pending') {
    return { success: false, message: '订单状态不允许取消' }
  }

  await updateOrderStatusAdmin(orderId, 'cancelled')

  return { success: true, message: '订单已取消' }
}

export async function getOrderStats(): Promise<OrderStats> {
  const today = new Date().toISOString().split('T')[0]

  const [totalResult, pendingResult, paidResult, revenueResult, todayResult, todayRevenueResult] = await Promise.all([
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders'),
    queryOne<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"),
    queryOne<{ count: number }>("SELECT COUNT(*) as count FROM orders WHERE status = 'paid'"),
    queryOne<{ total: number }>("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'paid'"),
    queryOne<{ count: number }>('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?', [today]),
    queryOne<{ total: number }>('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = ? AND DATE(created_at) = ?', ['paid', today])
  ])

  return {
    totalOrders: totalResult?.count ?? 0,
    pendingOrders: pendingResult?.count ?? 0,
    paidOrders: paidResult?.count ?? 0,
    totalRevenue: revenueResult?.total ?? 0,
    todayOrders: todayResult?.count ?? 0,
    todayRevenue: todayRevenueResult?.total ?? 0
  }
}
