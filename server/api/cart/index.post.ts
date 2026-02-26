import { requireAuth } from '../../utils/auth'
import { addToCart, getService } from '../../utils/services'
import { successResponse, throwBadRequest, throwNotFound } from '../../utils/response'
import { z } from 'zod'

const addSchema = z.object({
  serviceId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1)
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = addSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const { serviceId, quantity } = result.data

  const service = await getService(serviceId)
  if (!service || !service.is_active) {
    throwNotFound('服务不存在')
  }

  const item = await addToCart(auth.userId, serviceId, quantity)

  return successResponse(item)
})
