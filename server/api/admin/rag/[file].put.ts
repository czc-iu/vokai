import { requireAdmin } from '../../../utils/adminAuth'
import { saveDocumentContent, indexDocuments } from '../../../utils/rag'
import { successResponse, throwBadRequest, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const filename = getRouterParam(event, 'file')
  
  if (!filename || !filename.endsWith('.md')) {
    return throwNotFound('Document not found')
  }
  
  const body = await readBody(event)
  
  if (!body || typeof body.content !== 'string') {
    return throwBadRequest('Content is required')
  }
  
  const saved = saveDocumentContent(filename, body.content)
  
  if (!saved) {
    return throwBadRequest('Failed to save document')
  }
  
  if (body.reindex) {
    await indexDocuments()
  }
  
  return successResponse({ 
    filename,
    message: 'Document saved successfully'
  })
})
