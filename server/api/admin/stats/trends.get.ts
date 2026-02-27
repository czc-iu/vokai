import { requireAdmin } from '../../../utils/adminAuth'
import { getUsageTrends } from '../usage/daily.get'
import { query } from '../../../utils/db'
import { successResponse } from '../../../utils/response'

export async function getOrderTrends(days: number = 30): Promise<{
  date: string
  orders: number
  revenue: number
}[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return query<any[]>(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
    FROM orders
    WHERE DATE(created_at) >= ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [startDate])
}

export async function getUserTrends(days: number = 30): Promise<{
  date: string
  newUsers: number
}[]> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return query<any[]>(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as newUsers
    FROM users
    WHERE DATE(created_at) >= ?
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `, [startDate])
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const days = parseInt(query.days as string) || 30

  const [usage, orders, users] = await Promise.all([
    getUsageTrends(days),
    getOrderTrends(days),
    getUserTrends(days)
  ])

  const usageMap = new Map(usage.map(u => [u.date, u]))
  const ordersMap = new Map(orders.map(o => [o.date, o]))
  const usersMap = new Map(users.map(u => [u.date, u]))

  const allDates = new Set([
    ...usage.map(u => u.date),
    ...orders.map(o => o.date),
    ...users.map(u => u.date)
  ])

  const trends = Array.from(allDates).sort().map(date => ({
    date,
    usage: usageMap.get(date) || { tokens: 0, conversations: 0, messages: 0 },
    orders: ordersMap.get(date) || { orders: 0, revenue: 0 },
    users: usersMap.get(date) || { newUsers: 0 }
  }))

  return successResponse(trends)
})
