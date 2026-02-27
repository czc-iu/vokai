import { requireAdmin } from '../../../utils/adminAuth'
import { deleteDocumentFile, getIndex } from '../../../utils/rag'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const filename = getRouterParam(event, 'file')
  
  if (!filename || !filename.endsWith('.md')) {
    return throwNotFound('Document not found')
  }
  
  const index = await getIndex()
  
  try {
    await index.deleteDocument(filename)
  } catch {
  }
  
  const deleted = deleteDocumentFile(filename)
  
  if (!deleted) {
    return throwNotFound('Failed to delete document')
  }
  
  return successResponse({ 
    message: 'Document deleted successfully'
  })
})
