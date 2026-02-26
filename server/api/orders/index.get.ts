import { requireAuth } from '../../utils/auth'
import { getUserOrders, getOrderCount } from '../../utils/orders'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const status = query.status as string | undefined
  const offset = (page - 1) * limit

  const [orders, total] = await Promise.all([
    getUserOrders(auth.userId, { status, limit, offset }),
    getOrderCount(auth.userId, status)
  ])

  return successResponse({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  })
})
