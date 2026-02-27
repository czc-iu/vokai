import { requireAdmin } from '../../../utils/adminAuth'
import { resetIndex } from '../../../utils/rag'
import { resetAllUserIndexes } from '../../../utils/userRag'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const systemResult = await resetIndex()
  const userResult = await resetAllUserIndexes()

  return successResponse({
    systemIndexed: systemResult.indexed,
    systemErrors: systemResult.errors,
    userReindexed: userResult.reindexed,
    userErrors: userResult.errors
  })
})
