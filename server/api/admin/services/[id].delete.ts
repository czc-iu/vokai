import { requireAdmin, logAdminAction } from '../../../utils/adminAuth'
import { deleteService, getService } from '../../../utils/services'
import { successResponse, errorResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    return errorResponse('无效的服务ID')
  }

  const existing = await getService(id)
  if (!existing) {
    throwNotFound('服务不存在')
  }

  try {
    await deleteService(id)

    await logAdminAction(admin.adminId, 'delete_service', { serviceId: id, name: existing.name }, 'service', id)

    return successResponse({ message: '删除成功' })
  } catch (error: any) {
    return errorResponse(error.message || '删除服务失败')
  }
})
