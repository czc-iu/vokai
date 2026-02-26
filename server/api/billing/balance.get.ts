import { requireAuth } from '../../utils/auth'
import { getOrCreateBalance, getDailyStats, getMonthlyStats } from '../../utils/billing'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const balance = await getOrCreateBalance(auth.userId)

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  const monthlyStats = await getMonthlyStats(auth.userId, currentYear, currentMonth)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const dailyStats = await getDailyStats(
    auth.userId,
    thirtyDaysAgo.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  )

  const totalConsumedLast30Days = dailyStats.reduce((sum, s) => sum + s.total_tokens, 0)

  return successResponse({
    balance: balance.balance,
    totalPurchased: balance.total_purchased,
    totalConsumed: balance.total_consumed,
    monthlyConsumption: monthlyStats.total_tokens,
    last30DaysConsumption: totalConsumedLast30Days,
    dailyStats
  })
})
