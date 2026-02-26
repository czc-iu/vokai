import { requireAuth } from '../../utils/auth'
import { getOrderById } from '../../utils/orders'
import { successResponse, throwNotFound } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('订单不存在')
  }

  const order = await getOrderById(parseInt(id))

  if (!order || order.user_id !== auth.userId) {
    throwNotFound('订单不存在')
  }

  return successResponse(order)
})
