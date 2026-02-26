import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'
import { successResponse, throwBadRequest } from '../../utils/response'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(100).optional(),
  company: z.string().max(100).optional(),
  avatar: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const updates: string[] = []
  const values: unknown[] = []
  
  if (result.data.name !== undefined) {
    updates.push('name = ?')
    values.push(result.data.name)
  }
  if (result.data.company !== undefined) {
    updates.push('company = ?')
    values.push(result.data.company)
  }
  if (result.data.avatar !== undefined) {
    updates.push('avatar = ?')
    values.push(result.data.avatar)
  }

  if (updates.length === 0) {
    throwBadRequest('没有需要更新的内容')
  }

  values.push(auth.userId)
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)

  return successResponse({ updated: true })
})
