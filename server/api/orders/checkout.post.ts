import { requireAuth } from '../../utils/auth'
import { getService } from '../../utils/services'
import { createOrder, createPayment } from '../../utils/orders'
import { successResponse, throwBadRequest } from '../../utils/response'
import { createPaymentUrl, getAlipayConfig, isAlipayConfigured } from '../../utils/alipay'
import { createNativePayOrder, getWechatPayConfig, isWechatPayConfigured } from '../../utils/wechat'
import { z } from 'zod'

const checkoutSchema = z.object({
  method: z.enum(['alipay', 'wechat', 'bank_transfer']),
  items: z.array(z.object({
    serviceId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1)
  })).min(1, '请选择要购买的服务')
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const result = checkoutSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const { method, items } = result.data

  if (method === 'alipay' && !isAlipayConfigured()) {
    throwBadRequest('支付宝支付未配置，请选择其他支付方式')
  }

  if (method === 'wechat' && !isWechatPayConfigured()) {
    throwBadRequest('微信支付未配置，请选择其他支付方式')
  }

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

  if (method === 'bank_transfer') {
    return successResponse({
      success: true,
      order,
      payment: {
        paymentNo: payment.payment_no,
        method: payment.method,
        amount: payment.amount
      },
      bankInfo: {
        bankName: config.bankName,
        bankAccount: config.bankAccount,
        accountName: config.bankAccountName,
        branchName: config.bankBranch
      },
      message: '订单已创建，请按照银行汇款信息完成转账'
    })
  }

  if (method === 'alipay') {
    const alipayConfig = getAlipayConfig()!
    const payUrl = createPaymentUrl(alipayConfig, {
      outTradeNo: payment.payment_no,
      totalAmount: payment.amount.toFixed(2),
      subject: 'TomyBot服务套餐',
      body: `订单支付：${order.order_no}`
    })

    return successResponse({
      success: false,
      order,
      payment: {
        paymentNo: payment.payment_no,
        method: payment.method,
        amount: payment.amount
      },
      payUrl,
      message: '正在跳转到支付宝...'
    })
  }

  if (method === 'wechat') {
    const wechatConfig = getWechatPayConfig()!
    try {
      const wechatOrder = await createNativePayOrder(wechatConfig, {
        outTradeNo: payment.payment_no,
        totalAmount: payment.amount,
        description: `TomyBot服务套餐-${order.order_no}`
      })

      return successResponse({
        success: false,
        order,
        payment: {
          paymentNo: payment.payment_no,
          method: payment.method,
          amount: payment.amount
        },
        codeUrl: wechatOrder.codeUrl,
        payUrl: `/pay/wechat/${payment.payment_no}`,
        message: '请使用微信扫码支付'
      })
    } catch (error: any) {
      throwBadRequest(error.message || '创建微信支付订单失败')
    }
  }

  return successResponse({
    success: false,
    order,
    payment: {
      paymentNo: payment.payment_no,
      method: payment.method,
      amount: payment.amount
    },
    message: '请完成支付'
  })
})
