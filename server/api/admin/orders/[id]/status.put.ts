import { requireAdmin, logAdminAction } from '../../../../utils/adminAuth'
import { getOrderAdmin, updateOrderStatusAdmin } from '../../../../utils/adminOrders'
import { successResponse, errorResponse, throwNotFound } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    throwNotFound('订单不存在')
  }

  const existing = await getOrderAdmin(id)
  if (!existing) {
    throwNotFound('订单不存在')
  }

  const body = await readBody(event)
  const status = body.status as 'pending' | 'paid' | 'cancelled' | 'refunded'

  if (!['pending', 'paid', 'cancelled', 'refunded'].includes(status)) {
    return errorResponse('无效的状态')
  }

  if (existing.status === status) {
    return successResponse({ message: '状态未变更', order: existing })
  }

  if (existing.status === 'paid' && status === 'pending') {
    return errorResponse('已付款订单不能改为待付款')
  }

  if (existing.status === 'cancelled' || existing.status === 'refunded') {
    return errorResponse('已取消或已退款的订单不能修改状态')
  }

  try {
    await updateOrderStatusAdmin(id, status, body.payment_method)

    const order = await getOrderAdmin(id)

    await logAdminAction(
      admin.adminId,
      'update_order_status',
      { orderId: id, orderNo: existing.order_no, oldStatus: existing.status, newStatus: status },
      'order',
      id
    )

    return successResponse({ message: '状态更新成功', order })
  } catch (error: any) {
    return errorResponse(error.message || '更新状态失败')
  }
})
