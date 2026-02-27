import { completePayment, getPayment } from '../../utils/orders'
import { verifySign, getAlipayConfig, isAlipayConfigured } from '../../utils/alipay'

export default defineEventHandler(async (event) => {
  if (!isAlipayConfigured()) {
    return 'fail'
  }

  const body = await readBody(event)
  const config = getAlipayConfig()!

  const params: Record<string, string> = {}
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      params[key] = value
    }
  }

  if (!verifySign(params, config.publicKey)) {
    console.error('Alipay notify: signature verification failed')
    return 'fail'
  }

  const { out_trade_no, trade_no, trade_status, total_amount } = params

  if (trade_status !== 'TRADE_SUCCESS' && trade_status !== 'TRADE_FINISHED') {
    console.log(`Alipay notify: trade_status=${trade_status}, ignoring`)
    return 'success'
  }

  const payment = await getPayment(out_trade_no)
  if (!payment) {
    console.error(`Alipay notify: payment not found: ${out_trade_no}`)
    return 'fail'
  }

  if (payment.status === 'success') {
    console.log(`Alipay notify: payment already completed: ${out_trade_no}`)
    return 'success'
  }

  const paymentAmount = Number(payment.amount).toFixed(2)
  if (paymentAmount !== total_amount) {
    console.error(`Alipay notify: amount mismatch: ${paymentAmount} vs ${total_amount}`)
    return 'fail'
  }

  const result = await completePayment(out_trade_no, trade_no)
  if (!result.success) {
    console.error(`Alipay notify: complete payment failed: ${out_trade_no}`)
    return 'fail'
  }

  console.log(`Alipay notify: payment completed: ${out_trade_no}, trade_no: ${trade_no}`)
  return 'success'
})
