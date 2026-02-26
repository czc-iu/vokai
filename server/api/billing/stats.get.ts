import { requireAuth } from '../../utils/auth'
import { getDailyStats } from '../../utils/billing'
import { successResponse, throwBadRequest } from '../../utils/response'
import { z } from 'zod'

const statsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误')
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const query = getQuery(event)

  const result = statsSchema.safeParse(query)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '参数错误')
  }

  const { startDate, endDate } = result.data

  const stats = await getDailyStats(auth.userId, startDate, endDate)

  return successResponse(stats)
})
