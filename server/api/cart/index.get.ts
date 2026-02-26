import { requireAuth } from '../../utils/auth'
import { getCartItems, getCartCount, getCartTotal } from '../../utils/services'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const [items, count, total] = await Promise.all([
    getCartItems(auth.userId),
    getCartCount(auth.userId),
    getCartTotal(auth.userId)
  ])

  return successResponse({
    items,
    count,
    totalAmount: total.totalAmount,
    totalTokens: total.totalTokens
  })
})
