import { createService } from '../../../utils/mcp'
import { successResponse, throwBadRequest } from '../../../utils/response'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1, '请输入服务名称').max(100),
  command: z.string().min(1, '请输入命令'),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = createSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const id = await createService(result.data)

  return successResponse({ id, ...result.data })
})
