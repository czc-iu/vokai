import { requireAdmin, logAdminAction } from '../../../../utils/adminAuth'
import { setServiceStatus, getService } from '../../../../utils/services'
import { successResponse, errorResponse, throwNotFound } from '../../../../utils/response'

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

  const body = await readBody(event)
  const isActive = body.is_active === true || body.is_active === 'true'

  try {
    await setServiceStatus(id, isActive)

    await logAdminAction(
      admin.adminId,
      isActive ? 'activate_service' : 'deactivate_service',
      { serviceId: id, name: existing.name },
      'service',
      id
    )

    return successResponse({ message: isActive ? '已上架' : '已下架', is_active: isActive })
  } catch (error: any) {
    return errorResponse(error.message || '操作失败')
  }
})
