import { requireAuth } from '../../../utils/auth'
import { query } from '../../../utils/db'
import { successResponse, throwBadRequest } from '../../../utils/response'

interface DbMessage {
  id: number
  role: string
  content: string
  created_at: Date
}

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const conversationId = getRouterParam(event, 'id')

  if (!conversationId) {
    throwBadRequest('缺少对话ID')
  }

  const messages = await query<DbMessage[]>(
    `SELECT m.id, m.role, m.content, m.created_at 
     FROM messages m
     JOIN conversations c ON m.conversation_id = c.id
     WHERE c.id = ? AND c.user_id = ?
     ORDER BY m.created_at ASC`,
    [conversationId, auth.userId]
  )

  return successResponse(messages)
})
