import crypto from 'crypto'

export interface WechatPayConfig {
  appId: string
  mchId: string
  apiKey: string
  serialNo: string
  privateKey: string
  notifyUrl: string
}

export interface WechatPayOrder {
  outTradeNo: string
  totalAmount: number
  description: string
}

export interface WechatPayNotify {
  id: string
  create_time: string
  resource_type: string
  event_type: string
  summary: string
  resource: {
    original_type: string
    algorithm: string
    ciphertext: string
    associated_data: string
    nonce: string
  }
}

const WECHAT_PAY_API = 'https://api.mch.weixin.qq.com'

function formatPrivateKey(privateKey: string): string {
  let key = privateKey.replace(/\\n/g, '\n').replace(/\s+/g, '')
  if (!key.includes('-----BEGIN')) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`
  }
  return key
}

function generateNonceStr(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function buildSignature(
  method: string,
  url: string,
  timestamp: number,
  nonceStr: string,
  body: string,
  privateKey: string
): string {
  const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`
  const formattedKey = formatPrivateKey(privateKey)
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(message)
  return sign.sign(formattedKey, 'base64')
}

function buildAuthorization(
  mchId: string,
  serialNo: string,
  nonceStr: string,
  timestamp: number,
  signature: string
): string {
  return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`
}

export function decryptResource(
  ciphertext: string,
  associatedData: string,
  nonce: string,
  apiKey: string
): string {
  const key = Buffer.from(apiKey, 'utf8')
  const iv = Buffer.from(nonce, 'utf8')
  const authTag = Buffer.from(ciphertext.slice(-16), 'base64')
  const data = Buffer.from(ciphertext.slice(0, -16), 'base64')
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  decipher.setAAD(Buffer.from(associatedData, 'utf8'))
  
  let decrypted = decipher.update(data, undefined, 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

export function verifyNotifySignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  publicKey: string
): boolean {
  const message = `${timestamp}\n${nonce}\n${body}\n`
  const verify = crypto.createVerify('RSA-SHA256')
  verify.update(message)
  return verify.verify(publicKey, signature, 'base64')
}

export async function createNativePayOrder(
  config: WechatPayConfig,
  order: WechatPayOrder
): Promise<{ codeUrl: string; prepayId: string }> {
  const url = '/v3/pay/transactions/native'
  const timestamp = Math.floor(Date.now() / 1000)
  const nonceStr = generateNonceStr()
  
  const body = JSON.stringify({
    appid: config.appId,
    mchid: config.mchId,
    description: order.description,
    out_trade_no: order.outTradeNo,
    time_expire: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace(/\.\d{3}/, ''),
    notify_url: config.notifyUrl,
    amount: {
      total: Math.round(order.totalAmount * 100),
      currency: 'CNY'
    }
  })
  
  const signature = buildSignature(
    'POST',
    url,
    timestamp,
    nonceStr,
    body,
    config.privateKey
  )
  
  const authorization = buildAuthorization(
    config.mchId,
    config.serialNo,
    nonceStr,
    timestamp,
    signature
  )
  
  const response = await fetch(`${WECHAT_PAY_API}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authorization
    },
    body
  })
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message || '创建微信支付订单失败')
  }
  
  return {
    codeUrl: result.code_url,
    prepayId: result.prepay_id
  }
}

export async function queryOrder(
  config: WechatPayConfig,
  outTradeNo: string
): Promise<{ tradeState: string; transactionId?: string }> {
  const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${config.mchId}`
  const timestamp = Math.floor(Date.now() / 1000)
  const nonceStr = generateNonceStr()
  
  const signature = buildSignature(
    'GET',
    url,
    timestamp,
    nonceStr,
    '',
    config.privateKey
  )
  
  const authorization = buildAuthorization(
    config.mchId,
    config.serialNo,
    nonceStr,
    timestamp,
    signature
  )
  
  const response = await fetch(`${WECHAT_PAY_API}${url}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': authorization
    }
  })
  
  const result = await response.json()
  
  if (!response.ok) {
    throw new Error(result.message || '查询微信支付订单失败')
  }
  
  return {
    tradeState: result.trade_state,
    transactionId: result.transaction_id
  }
}

export function getWechatPayConfig(): WechatPayConfig | null {
  const config = useRuntimeConfig()
  
  if (!config.wechatAppId || !config.wechatMchId || !config.wechatApiKey) {
    return null
  }
  
  return {
    appId: config.wechatAppId,
    mchId: config.wechatMchId,
    apiKey: config.wechatApiKey,
    serialNo: config.wechatSerialNo,
    privateKey: config.wechatPrivateKey,
    notifyUrl: config.wechatNotifyUrl
  }
}

export function isWechatPayConfigured(): boolean {
  const config = useRuntimeConfig()
  return !!(config.wechatAppId && config.wechatMchId && config.wechatApiKey && config.wechatPrivateKey)
}
