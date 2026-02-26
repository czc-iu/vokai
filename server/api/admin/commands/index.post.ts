import { addCommand } from '../../../utils/executor'
import { successResponse, throwBadRequest } from '../../../utils/response'
import { z } from 'zod'

const commandSchema = z.object({
  command: z.string().min(1, '请输入命令').max(100),
  description: z.string().optional(),
  enabled: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = commandSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const id = await addCommand(result.data)

  return successResponse({ id, ...result.data })
})
