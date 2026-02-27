import { requireAdmin } from '../../../utils/adminAuth'
import { getDocumentContent } from '../../../utils/rag'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const filename = getRouterParam(event, 'file')
  
  if (!filename || !filename.endsWith('.md')) {
    return throwNotFound('Document not found')
  }
  
  const content = getDocumentContent(filename)
  
  if (content === null) {
    return throwNotFound('Document not found')
  }
  
  return successResponse({
    filename,
    content
  })
})
