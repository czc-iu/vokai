import { requireAdmin } from '../../../utils/adminAuth'
import { updateMcpService, getMcpService } from '../../../utils/mcp'
import { successResponse, throwBadRequest, throwNotFound } from '../../../utils/response'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  command: z.string().min(1).optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  description: z.string().optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = parseInt(getRouterParam(event, 'id') || '')
  if (!id || isNaN(id)) {
    throwBadRequest('无效的服务ID')
  }

  const existing = await getMcpService(id)
  if (!existing) {
    throwNotFound('服务不存在')
  }

  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const updated = await updateMcpService(id, result.data)
  if (!updated) {
    throwBadRequest('更新失败')
  }

  return successResponse({ id, ...result.data })
})
