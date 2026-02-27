import { requireAdmin } from '../../../utils/adminAuth'
import { getOrderStats } from '../../../utils/adminOrders'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const stats = await getOrderStats()

  return successResponse(stats)
})
