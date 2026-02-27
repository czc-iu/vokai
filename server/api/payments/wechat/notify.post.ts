import { completePayment, getPayment } from '../../../utils/orders'
import { decryptResource, getWechatPayConfig, isWechatPayConfigured } from '../../../utils/wechat'
import type { WechatPayNotify } from '../../../utils/wechat'

export default defineEventHandler(async (event) => {
  if (!isWechatPayConfigured()) {
    return {
      code: 'FAIL',
      message: '微信支付未配置'
    }
  }

  const config = getWechatPayConfig()!
  const body = await readBody<WechatPayNotify>(event)

  if (body.event_type !== 'TRANSACTION.SUCCESS') {
    console.log(`Wechat notify: event_type=${body.event_type}, ignoring`)
    return { code: 'SUCCESS', message: '成功' }
  }

  const { resource } = body
  
  let decryptedData: any
  try {
    const decryptedStr = decryptResource(
      resource.ciphertext,
      resource.associated_data,
      resource.nonce,
      config.apiKey
    )
    decryptedData = JSON.parse(decryptedStr)
  } catch (error) {
    console.error('Wechat notify: decrypt failed', error)
    return { code: 'FAIL', message: '解密失败' }
  }

  const { out_trade_no, transaction_id, trade_state } = decryptedData

  if (trade_state !== 'SUCCESS') {
    console.log(`Wechat notify: trade_state=${trade_state}, ignoring`)
    return { code: 'SUCCESS', message: '成功' }
  }

  const payment = await getPayment(out_trade_no)
  if (!payment) {
    console.error(`Wechat notify: payment not found: ${out_trade_no}`)
    return { code: 'FAIL', message: '支付单不存在' }
  }

  if (payment.status === 'success') {
    console.log(`Wechat notify: payment already completed: ${out_trade_no}`)
    return { code: 'SUCCESS', message: '成功' }
  }

  const result = await completePayment(out_trade_no, transaction_id)
  if (!result.success) {
    console.error(`Wechat notify: complete payment failed: ${out_trade_no}`)
    return { code: 'FAIL', message: '完成支付失败' }
  }

  console.log(`Wechat notify: payment completed: ${out_trade_no}, transaction_id: ${transaction_id}`)
  return { code: 'SUCCESS', message: '成功' }
})
