import { requireAdmin } from '../../../utils/adminAuth'
import { indexDocuments } from '../../../utils/rag'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const result = await indexDocuments()

  return successResponse({
    indexed: result.indexed,
    errors: result.errors
  })
})
