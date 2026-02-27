import { requireAdmin } from '../../../utils/adminAuth'
import { createDocument } from '../../../utils/rag'
import { successResponse, throwBadRequest } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const body = await readBody(event)
  
  if (!body || !body.filename || typeof body.filename !== 'string') {
    return throwBadRequest('Filename is required')
  }
  
  let filename = body.filename.trim()
  if (!filename.endsWith('.md')) {
    filename += '.md'
  }
  
  if (!/^[\w\u4e00-\u9fa5\-_.]+$/.test(filename)) {
    return throwBadRequest('Invalid filename')
  }
  
  const content = body.content || `# ${filename.replace('.md', '')}\n\n`
  
  const created = createDocument(filename, content)
  
  if (!created) {
    return throwBadRequest('Document already exists or failed to create')
  }
  
  return successResponse({ 
    filename,
    message: 'Document created successfully'
  })
})
