import { requireAdmin } from '../../../utils/adminAuth'
import { getTransactionStats } from './index.get'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const stats = await getTransactionStats()

  return successResponse(stats)
})
