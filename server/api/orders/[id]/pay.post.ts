import { requireAuth } from '../../../utils/auth'
import { getOrderById, createPayment } from '../../../utils/orders'
import { successResponse, throwBadRequest, throwNotFound } from '../../../utils/response'
import { z } from 'zod'

const paySchema = z.object({
  method: z.enum(['alipay', 'wechat', 'bank_transfer'])
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const config = useRuntimeConfig()

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

  if (result.data!.method === 'bank_transfer') {
    return successResponse({
      success: true,
      paymentNo: payment.payment_no,
      method: payment.method,
      amount: payment.amount,
      bankInfo: {
        bankName: config.bankName,
        bankAccount: config.bankAccount,
        accountName: config.bankAccountName,
        branchName: config.bankBranch
      },
      message: '请按照银行汇款信息完成转账'
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
