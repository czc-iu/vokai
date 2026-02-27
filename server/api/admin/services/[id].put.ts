import { requireAdmin, logAdminAction } from '../../../utils/adminAuth'
import { updateService, getService } from '../../../utils/services'
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

  const body = await readBody(event)

  try {
    const updateData: Record<string, unknown> = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.tokens !== undefined) updateData.tokens = body.tokens
    if (body.price !== undefined) updateData.price = body.price
    if (body.original_price !== undefined) updateData.original_price = body.original_price || null
    if (body.validity_days !== undefined) updateData.validity_days = body.validity_days || null
    if (body.features !== undefined) updateData.features = body.features ? JSON.stringify(body.features) : null
    if (body.is_popular !== undefined) updateData.is_popular = body.is_popular
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

    const service = await updateService(id, updateData)

    await logAdminAction(admin.adminId, 'update_service', { serviceId: id, changes: body }, 'service', id)

    return successResponse(service)
  } catch (error: any) {
    console.error('Update service error:', error)
    return errorResponse(error.message || '更新服务失败')
  }
})
