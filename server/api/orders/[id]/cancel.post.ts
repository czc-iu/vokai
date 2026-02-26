import { requireAuth } from '../../../utils/auth'
import { cancelOrder, getOrderById } from '../../../utils/orders'
import { successResponse, throwBadRequest, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('订单不存在')
  }

  const orderId = parseInt(id)
  const order = await getOrderById(orderId)
  if (!order || order.user_id !== auth.userId) {
    throwNotFound('订单不存在')
  }

  const cancelled = await cancelOrder(orderId, auth.userId)

  if (!cancelled) {
    throwBadRequest('订单无法取消，可能已支付或已取消')
  }

  return successResponse({ cancelled: true })
})
