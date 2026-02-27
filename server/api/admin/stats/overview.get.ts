import { requireAdmin } from '../../../utils/adminAuth'
import { getUserStatsAdmin } from '../../../utils/adminUsers'
import { getOrderStats } from '../../../utils/adminOrders'
import { getServiceStats } from '../../../utils/services'
import { getUsageSummaryAdmin } from '../usage/daily.get'
import { getTransactionStats } from '../transactions/index.get'
import { queryOne } from '../../../utils/db'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [
    userStats,
    orderStats,
    serviceStats,
    usageSummary,
    transactionStats
  ] = await Promise.all([
    getUserStatsAdmin(),
    getOrderStats(),
    getServiceStats(),
    getUsageSummaryAdmin(),
    getTransactionStats()
  ])

  const totalBalanceResult = await queryOne<{ total: number }>(
    'SELECT COALESCE(SUM(balance), 0) as total FROM token_balances'
  )

  return successResponse({
    users: userStats,
    orders: orderStats,
    services: serviceStats,
    usage: usageSummary,
    transactions: transactionStats,
    totalTokenBalance: totalBalanceResult?.total ?? 0
  })
})
