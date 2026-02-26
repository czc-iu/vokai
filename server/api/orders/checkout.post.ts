import { requireAuth } from '../../utils/auth'
import { getService } from '../../utils/services'
import { createOrder, createPayment, completePayment } from '../../utils/orders'
import { successResponse, throwBadRequest } from '../../utils/response'
import { z } from 'zod'

const checkoutSchema = z.object({
  method: z.enum(['alipay', 'wechat', 'balance']),
  items: z.array(z.object({
    serviceId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1)
  })).min(1, '请选择要购买的服务')
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = checkoutSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const { method, items } = result.data

  const orderItems: Array<{
    serviceId: number
    serviceName: string
    tokens: number
    price: number
    quantity: number
  }> = []

  let totalTokens = 0
  let totalAmount = 0

  for (const item of items) {
    const service = await getService(item.serviceId)
    if (!service || !service.is_active) {
      throwBadRequest(`服务 ID ${item.serviceId} 不存在或已下架`)
    }
    orderItems.push({
      serviceId: service.id,
      serviceName: service.name,
      tokens: service.tokens,
      price: Number(service.price),
      quantity: item.quantity
    })
    totalTokens += service.tokens * item.quantity
    totalAmount += Number(service.price) * item.quantity
  }

  const order = await createOrder(auth.userId, orderItems)

  const payment = await createPayment(order.id, auth.userId, method, totalAmount)

  if (method === 'balance') {
    const { consumeTokens } = await import('../../utils/billing')
    const success = await consumeTokens(
      auth.userId,
      totalTokens,
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
      message: '支付成功，服务已开通'
    })
  }

  return successResponse({
    success: false,
    order,
    payment: {
      paymentNo: payment.payment_no,
      method: payment.method,
      amount: payment.amount
    },
    message: '请使用支付宝或微信完成支付',
    payUrl: `/pay/${payment.payment_no}`
  })
})
