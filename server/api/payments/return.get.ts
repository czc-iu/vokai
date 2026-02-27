import { completePayment, getPayment } from '../../utils/orders'
import { verifySign, getAlipayConfig, isAlipayConfigured } from '../../utils/alipay'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  if (!isAlipayConfigured()) {
    return sendRedirect(event, '/pay/result?status=error&message=支付宝未配置')
  }

  const config = getAlipayConfig()!

  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      params[key] = value
    }
  }

  const { out_trade_no, trade_no } = params

  if (!out_trade_no) {
    return sendRedirect(event, '/pay/result?status=error&message=缺少支付单号')
  }

  const payment = await getPayment(out_trade_no)
  if (!payment) {
    return sendRedirect(event, `/pay/result?status=error&message=支付单不存在&paymentNo=${out_trade_no}`)
  }

  if (payment.status === 'success') {
    return sendRedirect(event, `/pay/result?status=success&paymentNo=${out_trade_no}`)
  }

  if (!verifySign(params, config.publicKey)) {
    return sendRedirect(event, `/pay/result?status=error&message=签名验证失败&paymentNo=${out_trade_no}`)
  }

  if (trade_no) {
    const result = await completePayment(out_trade_no, trade_no)
    if (result.success) {
      return sendRedirect(event, `/pay/result?status=success&paymentNo=${out_trade_no}`)
    }
  }

  return sendRedirect(event, `/pay/result?status=pending&paymentNo=${out_trade_no}&message=支付处理中，请稍后查看订单状态`)
})
