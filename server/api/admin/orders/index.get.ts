import { requireAdmin } from '../../../utils/adminAuth'
import { getOrdersAdmin, getOrdersCount, getOrderStats } from '../../../utils/adminOrders'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const offset = (page - 1) * limit

  const options = {
    search: query.search as string | undefined,
    status: query.status as string | undefined,
    userId: query.userId ? parseInt(query.userId as string) : undefined,
    startDate: query.startDate as string | undefined,
    endDate: query.endDate as string | undefined,
    sortBy: (query.sortBy as string) || 'created_at',
    sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    limit,
    offset
  }

  const [orders, total, stats] = await Promise.all([
    getOrdersAdmin(options),
    getOrdersCount(options),
    query.stats === 'true' ? getOrderStats() : null
  ])

  const response: any = {
    orders,
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
