import { requireAdmin } from '../../../../utils/adminAuth'
import { getUserActivityStats } from '../../../../utils/adminUsers'
import { successResponse, throwNotFound } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    throwNotFound('用户不存在')
  }

  const activity = await getUserActivityStats(id)

  return successResponse(activity)
})
