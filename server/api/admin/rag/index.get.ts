import { requireAdmin } from '../../../utils/adminAuth'
import { listDocuments, getIndexStatus } from '../../../utils/rag'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const status = await getIndexStatus()
  const documents = await listDocuments()

  return successResponse({
    isCreated: status.isCreated,
    stats: status.stats,
    documents
  })
})
