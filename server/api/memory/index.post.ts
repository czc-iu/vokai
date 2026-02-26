import { requireAuth } from '../../utils/auth'
import { setMemory } from '../../utils/memory'
import { successResponse, throwBadRequest } from '../../utils/response'
import { z } from 'zod'

const memorySchema = z.object({
  key: z.string().min(1, '请输入记忆键名').max(100),
  value: z.string().min(1, '请输入记忆内容').max(2000)
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = memorySchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  await setMemory(auth.userId, result.data.key, result.data.value, 'manual')

  return successResponse({ key: result.data.key, value: result.data.value })
})
