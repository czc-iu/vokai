import { requireAuth } from '../../utils/auth'
import { removeFromCart } from '../../utils/services'
import { successResponse, throwNotFound } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('购物车项不存在')
  }

  const deleted = await removeFromCart(auth.userId, parseInt(id))

  if (!deleted) {
    throwNotFound('购物车项不存在')
  }

  return successResponse({ deleted: true })
})
