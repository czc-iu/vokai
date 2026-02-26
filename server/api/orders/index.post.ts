import { requireAuth } from '../../utils/auth'
import { createOrder } from '../../utils/orders'
import { getService } from '../../utils/services'
import { successResponse, throwBadRequest } from '../../utils/response'
import { z } from 'zod'

const createSchema = z.object({
  items: z.array(z.object({
    serviceId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1)
  })).min(1, '请选择要购买的服务')
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = createSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const orderItems: Array<{
    serviceId: number
    serviceName: string
    tokens: number
    price: number
    quantity: number
  }> = []

  for (const item of result.data.items) {
    const service = await getService(item.serviceId)
    if (!service || !service.is_active) {
      throwBadRequest(`服务 ID ${item.serviceId} 不存在或已下架`)
    }
    orderItems.push({
      serviceId: service.id,
      serviceName: service.name,
      tokens: service.tokens,
      price: Number(service.price),
      quantity: item.quantity
    })
  }

  const order = await createOrder(auth.userId, orderItems)

  return successResponse(order)
})
