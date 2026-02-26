import { query } from '~/server/utils/db'
import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const documents = await query<any>(
    'SELECT id, filename, description, is_indexed, created_at, updated_at FROM user_documents WHERE user_id = ? ORDER BY created_at DESC',
    [user.userId]
  )
  
  return successResponse(documents)
})
