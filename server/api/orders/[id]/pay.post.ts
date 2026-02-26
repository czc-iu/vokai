import { requireAuth } from '../../../utils/auth'
import { getOrderById, createPayment, completePayment } from '../../../utils/orders'
import { successResponse, throwBadRequest, throwNotFound } from '../../../utils/response'
import { z } from 'zod'

const paySchema = z.object({
  method: z.enum(['alipay', 'wechat', 'balance'])
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throwNotFound('订单不存在')
  }

  const result = paySchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const orderId = parseInt(id)
  const order = await getOrderById(orderId)
  if (!order || order.user_id !== auth.userId) {
    throwNotFound('订单不存在')
  }

  if (order.status !== 'pending') {
    throwBadRequest('订单状态不允许支付')
  }

  const payment = await createPayment(
    orderId,
    auth.userId,
    result.data!.method,
    Number(order.total_amount)
  )

  if (result.data!.method === 'balance') {
    const { consumeTokens } = await import('../../../utils/billing')
    const success = await consumeTokens(
      auth.userId,
      order.total_tokens,
      `购买服务：订单 ${order.order_no}`,
      'order',
      order.id
    )

    if (!success) {
      throwBadRequest('余额不足，请先充值')
    }

    const completed = await completePayment(payment.payment_no, `BALANCE_${Date.now()}`)

    return successResponse({
      success: true,
      order: completed.order,
      message: '支付成功'
    })
  }

  return successResponse({
    success: false,
    paymentNo: payment.payment_no,
    method: payment.method,
    amount: payment.amount,
    message: '请使用支付宝或微信完成支付',
    qrCodeUrl: `/api/payments/${payment.payment_no}/qrcode`
  })
})
