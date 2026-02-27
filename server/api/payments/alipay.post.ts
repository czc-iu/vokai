import { requireAuth } from '../../utils/auth'
import { getPayment } from '../../utils/orders'
import { successResponse, throwBadRequest, throwNotFound } from '../../utils/response'
import { getAlipayConfig, createPaymentUrl, isAlipayConfigured } from '../../utils/alipay'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  if (!isAlipayConfigured()) {
    throwBadRequest('支付宝支付未配置')
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

  const config = getAlipayConfig()!
  const payUrl = createPaymentUrl(config, {
    outTradeNo: payment.payment_no,
    totalAmount: payment.amount.toFixed(2),
    subject: 'TomyBot服务套餐',
    body: `订单支付：${payment.payment_no}`
  })

  return successResponse({
    payUrl,
    paymentNo: payment.payment_no,
    amount: payment.amount
  })
})
