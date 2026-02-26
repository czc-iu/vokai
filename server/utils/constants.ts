export const QWEN_DEFAULT_MODEL = 'qwen-plus'
export const QWEN_DEFAULT_TEMPERATURE = 0.7
export const QWEN_DEFAULT_MAX_TOKENS = 2000

export const ERROR_MESSAGES = {
  AI_NOT_CONFIGURED: 'AI服务未配置',
  AI_REQUEST_FAILED: 'AI服务请求失败',
  AI_UNAVAILABLE: 'AI服务暂时不可用',
  AI_STREAM_UNAVAILABLE: '无法读取响应流',
  
  AUTH_REQUIRED: '请先登录',
  LOGIN_FAILED: '邮箱或密码错误',
  ACCOUNT_DISABLED: '账户已被禁用，请联系管理员',
  EMAIL_EXISTS: '该邮箱已被注册',
  USER_NOT_FOUND: '用户不存在',
  
  METHOD_NOT_ALLOWED: '方法不允许',
  VALIDATION_FAILED: '验证失败'
} as const

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_ERROR: 500
} as const
