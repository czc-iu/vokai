import { requireAdmin, logAdminAction } from '../../../utils/adminAuth'
import { createService } from '../../../utils/services'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const body = await readBody(event)

  if (!body.name || !body.tokens || !body.price) {
    return errorResponse('请填写必填字段：名称、Token数量、价格')
  }

  try {
    const service = await createService({
      name: body.name,
      description: body.description,
      tokens: body.tokens,
      price: body.price,
      original_price: body.original_price,
      validity_days: body.validity_days,
      features: body.features,
      is_popular: body.is_popular,
      sort_order: body.sort_order
    })

    await logAdminAction(admin.adminId, 'create_service', { serviceId: service.id, name: service.name }, 'service', service.id)

    return successResponse(service)
  } catch (error: any) {
    return errorResponse(error.message || '创建服务失败')
  }
})
