import { requireAdmin } from '../../../utils/adminAuth'
import { getAllServicesAdmin, getServiceStats } from '../../../utils/services'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const includeStats = query.stats === 'true'

  const services = await getAllServicesAdmin()

  if (includeStats) {
    const stats = await getServiceStats()
    return successResponse({ services, stats })
  }

  return successResponse(services)
})
