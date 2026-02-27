import { requireAdmin } from '../../../utils/adminAuth'
import { getUsersAdmin, getUsersCount, getUserStatsAdmin } from '../../../utils/adminUsers'
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
    role: query.role as string | undefined,
    sortBy: (query.sortBy as string) || 'created_at',
    sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    limit,
    offset
  }

  const [users, total, stats] = await Promise.all([
    getUsersAdmin(options),
    getUsersCount(options),
    query.stats === 'true' ? getUserStatsAdmin() : null
  ])

  const response: any = {
    users,
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
