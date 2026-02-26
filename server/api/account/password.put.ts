import { requireAuth } from '../../utils/auth'
import { queryOne, query } from '../../utils/db'
import { successResponse, throwBadRequest } from '../../utils/response'
import { comparePassword, hashPassword } from '../../utils/auth'
import { z } from 'zod'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: z.string().min(8, '新密码至少8个字符').max(100),
  confirmPassword: z.string().min(1, '请确认新密码')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = passwordSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const user = await queryOne<{ password_hash: string }>(
    'SELECT password_hash FROM users WHERE id = ?',
    [auth.userId]
  )

  if (!user) {
    throwBadRequest('用户不存在')
  }

  const isValid = await comparePassword(result.data.currentPassword, user.password_hash)
  if (!isValid) {
    throwBadRequest('当前密码错误')
  }

  const newHash = await hashPassword(result.data.newPassword)
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, auth.userId])

  return successResponse({ updated: true })
})
