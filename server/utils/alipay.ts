import crypto from 'crypto'

export interface AlipayConfig {
  appId: string
  privateKey: string
  publicKey: string
  notifyUrl: string
  returnUrl: string
  sandbox: boolean
}

export interface AlipayOrder {
  outTradeNo: string
  totalAmount: string
  subject: string
  body?: string
}

export interface AlipayNotifyParams {
  notify_time: string
  notify_type: string
  notify_id: string
  app_id: string
  charset: string
  version: string
  sign_type: string
  sign: string
  trade_no: string
  out_trade_no: string
  trade_status: string
  total_amount: string
  receipt_amount: string
  buyer_pay_amount: string
  point_amount: string
  invoice_amount: string
  gmt_create: string
  gmt_payment: string
  fund_bill_list: string
  passback_params: string
  subject: string
  body: string
  buyer_id: string
  buyer_logon_id: string
  seller_id: string
  seller_email: string
}

const ALIPAY_GATEWAY = 'https://openapi.alipay.com/gateway.do'
const ALIPAY_SANDBOX_GATEWAY = 'https://openapi.alipaydev.com/gateway.do'

function formatPrivateKey(privateKey: string): string {
  let key = privateKey.replace(/\s+/g, '')
  if (!key.startsWith('-----BEGIN RSA PRIVATE KEY-----')) {
    key = `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`
  }
  return key
}

function formatPublicKey(publicKey: string): string {
  let key = publicKey.replace(/\s+/g, '')
  if (!key.startsWith('-----BEGIN PUBLIC KEY-----')) {
    key = `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
  }
  return key
}

function buildQueryString(params: Record<string, string>): string {
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .sort()
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
}

function sign(params: Record<string, string>, privateKey: string): string {
  const queryString = buildQueryString(params)
  const formattedKey = formatPrivateKey(privateKey)
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(queryString)
  return sign.sign(formattedKey, 'base64')
}

export function verifySign(params: Record<string, string>, publicKey: string): boolean {
  const { sign: signValue, sign_type, ...restParams } = params
  
  if (!signValue) return false
  
  const queryString = buildQueryString(restParams)
  const formattedKey = formatPublicKey(publicKey)
  const verify = crypto.createVerify('RSA-SHA256')
  verify.update(queryString)
  
  return verify.verify(formattedKey, signValue, 'base64')
}

export function createPaymentUrl(
  config: AlipayConfig,
  order: AlipayOrder
): string {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  
  const bizContent = JSON.stringify({
    out_trade_no: order.outTradeNo,
    total_amount: order.totalAmount,
    subject: order.subject,
    product_code: 'FAST_INSTANT_TRADE_PAY',
    body: order.body || order.subject
  })
  
  const params: Record<string, string> = {
    app_id: config.appId,
    method: 'alipay.trade.page.pay',
    format: 'JSON',
    return_url: config.returnUrl,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp,
    version: '1.0',
    notify_url: config.notifyUrl,
    biz_content: bizContent
  }
  
  const signature = sign(params, config.privateKey)
  params.sign = signature
  
  const gateway = config.sandbox ? ALIPAY_SANDBOX_GATEWAY : ALIPAY_GATEWAY
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  return `${gateway}?${queryString}`
}

export function createH5PaymentUrl(
  config: AlipayConfig,
  order: AlipayOrder
): string {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  
  const bizContent = JSON.stringify({
    out_trade_no: order.outTradeNo,
    total_amount: order.totalAmount,
    subject: order.subject,
    product_code: 'QUICK_WAP_WAY',
    body: order.body || order.subject
  })
  
  const params: Record<string, string> = {
    app_id: config.appId,
    method: 'alipay.trade.wap.pay',
    format: 'JSON',
    return_url: config.returnUrl,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp,
    version: '1.0',
    notify_url: config.notifyUrl,
    biz_content: bizContent
  }
  
  const signature = sign(params, config.privateKey)
  params.sign = signature
  
  const gateway = config.sandbox ? ALIPAY_SANDBOX_GATEWAY : ALIPAY_GATEWAY
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
  
  return `${gateway}?${queryString}`
}

export function getAlipayConfig(): AlipayConfig | null {
  const config = useRuntimeConfig()
  
  if (!config.alipayAppId || !config.alipayPrivateKey) {
    return null
  }
  
  return {
    appId: config.alipayAppId,
    privateKey: config.alipayPrivateKey,
    publicKey: config.alipayPublicKey,
    notifyUrl: config.alipayNotifyUrl,
    returnUrl: config.alipayReturnUrl,
    sandbox: config.alipaySandbox
  }
}

export function isAlipayConfigured(): boolean {
  const config = useRuntimeConfig()
  return !!(config.alipayAppId && config.alipayPrivateKey)
}
