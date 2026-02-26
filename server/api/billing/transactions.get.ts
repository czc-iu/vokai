import { requireAuth } from '../../utils/auth'
import { getTransactions, getTransactionCount } from '../../utils/billing'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const queryParams = getQuery(event)

  const page = Math.max(1, Number(queryParams.page) || 1)
  const limitVal = Math.min(100, Math.max(1, Number(queryParams.limit) || 20))
  const typeParam = queryParams.type as string | undefined
  const offsetVal = (page - 1) * limitVal

  // Ensure we pass proper types
  const options: { type?: string; limit: number; offset: number } = {
    limit: limitVal,
    offset: offsetVal
  }
  if (typeParam) {
    options.type = typeParam
  }

  const transactions = await getTransactions(auth.userId, options)
  const total = await getTransactionCount(auth.userId, typeParam)

  return successResponse({
    transactions,
    pagination: {
      page,
      limit: limitVal,
      total,
      totalPages: Math.ceil(total / limitVal)
    }
  })
})
