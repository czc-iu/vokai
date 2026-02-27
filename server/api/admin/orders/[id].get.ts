import { requireAdmin } from '../../../utils/adminAuth'
import { getOrderAdmin } from '../../../utils/adminOrders'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    throwNotFound('订单不存在')
  }

  const order = await getOrderAdmin(id)
  if (!order) {
    throwNotFound('订单不存在')
  }

  return successResponse(order)
})
