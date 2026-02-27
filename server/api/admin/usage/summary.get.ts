import { requireAdmin } from '../../../utils/adminAuth'
import { getUsageSummaryAdmin, getUsageTrends } from './daily.get'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const days = parseInt(query.days as string) || 30

  const [summary, trends] = await Promise.all([
    getUsageSummaryAdmin(),
    getUsageTrends(days)
  ])

  return successResponse({
    summary,
    trends
  })
})
