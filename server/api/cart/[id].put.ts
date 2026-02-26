import { requireAuth } from '../../utils/auth'
import { updateCartItemQuantity } from '../../utils/services'
import { successResponse, throwBadRequest, throwNotFound } from '../../utils/response'
import { z } from 'zod'

const updateSchema = z.object({
  quantity: z.number().int().min(0)
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throwNotFound('购物车项不存在')
  }

  const result = updateSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const updated = await updateCartItemQuantity(auth.userId, parseInt(id), result.data.quantity)

  if (!updated) {
    throwNotFound('购物车项不存在')
  }

  return successResponse({ updated: true })
})
