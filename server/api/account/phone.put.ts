import { requireAuth } from '../../utils/auth'
import { queryOne, query } from '../../utils/db'
import { successResponse, throwBadRequest, throwConflict } from '../../utils/response'
import { z } from 'zod'

const phoneSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  code: z.string().length(6, '验证码为6位数字').optional()
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = phoneSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const { phone } = result.data

  const existing = await queryOne<{ id: number }>(
    'SELECT id FROM users WHERE phone = ? AND id != ?',
    [phone, auth.userId]
  )

  if (existing) {
    throwConflict('该手机号已被其他账号绑定')
  }

  await query(
    'UPDATE users SET phone = ?, phone_verified = TRUE WHERE id = ?',
    [phone, auth.userId]
  )

  return successResponse({ updated: true, phone })
})
