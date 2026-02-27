import { requireAuth } from '../../utils/auth'
import { getPayment } from '../../utils/orders'
import { successResponse, throwBadRequest, throwNotFound } from '../../utils/response'
import { createNativePayOrder, getWechatPayConfig, isWechatPayConfigured } from '../../utils/wechat'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  if (!isWechatPayConfigured()) {
    throwBadRequest('微信支付未配置')
  }

  const { paymentNo } = body
  if (!paymentNo) {
    throwBadRequest('缺少支付单号')
  }

  const payment = await getPayment(paymentNo)
  if (!payment || payment.user_id !== auth.userId) {
    throwNotFound('支付单不存在')
  }

  if (payment.status !== 'pending') {
    throwBadRequest('支付单状态不允许支付')
  }

  const config = getWechatPayConfig()!
  
  try {
    const result = await createNativePayOrder(config, {
      outTradeNo: payment.payment_no,
      totalAmount: payment.amount,
      description: 'TomyBot服务套餐'
    })

    return successResponse({
      codeUrl: result.codeUrl,
      prepayId: result.prepayId,
      paymentNo: payment.payment_no,
      amount: payment.amount
    })
  } catch (error: any) {
    throwBadRequest(error.message || '创建微信支付订单失败')
  }
})
