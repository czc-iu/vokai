import { requireAuth } from '../../utils/auth'
import { query } from '../../utils/db'
import { successResponse } from '../../utils/response'

interface DbConversation {
  id: number
  title: string
  created_at: Date
  updated_at: Date
}

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const conversations = await query<DbConversation[]>(
    'SELECT id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50',
    [auth.userId]
  )

  return successResponse(conversations)
})
