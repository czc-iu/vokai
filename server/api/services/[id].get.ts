import { getService } from '../../utils/services'
import { successResponse, throwNotFound } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('服务不存在')
  }

  const service = await getService(parseInt(id))

  if (!service || !service.is_active) {
    throwNotFound('服务不存在')
  }

  return successResponse(service)
})
