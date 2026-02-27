import { requireAuth } from '../../../utils/auth'
import { getPayment } from '../../../utils/orders'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const paymentNo = getRouterParam(event, 'paymentNo')

  if (!paymentNo) {
    return successResponse({ status: 'unknown' })
  }

  const payment = await getPayment(paymentNo)
  if (!payment || payment.user_id !== auth.userId) {
    throwNotFound('支付单不存在')
  }

  return successResponse({
    status: payment.status,
    paymentNo: payment.payment_no,
    amount: payment.amount,
    paidAt: payment.paid_at
  })
})
