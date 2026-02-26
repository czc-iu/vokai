import { requireAdmin } from '../../../utils/adminAuth'
import { deleteService, disconnectService } from '../../../utils/mcp'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('服务不存在')
  }

  await disconnectService(id)
  const deleted = await deleteService(parseInt(id))

  if (!deleted) {
    throwNotFound('服务不存在')
  }

  return successResponse({ deleted: true })
})
