import { requireAuth } from '../../../utils/auth'
import { query } from '../../../utils/db'
import { successResponse, throwNotFound, throwBadRequest } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const conversationId = getRouterParam(event, 'id')

  if (!conversationId) {
    throwBadRequest('缺少对话ID')
  }

  const conversations = await query<any[]>(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    [conversationId, auth.userId]
  )

  if (conversations.length === 0) {
    throwNotFound('对话不存在')
  }

  const messageIds = await query<{ id: number }[]>(
    'SELECT id FROM messages WHERE conversation_id = ?',
    [conversationId]
  )

  if (messageIds.length > 0) {
    const ids = messageIds.map(m => m.id)
    const placeholders = ids.map(() => '?').join(',')
    await query(`DELETE FROM shared_messages WHERE message_id IN (${placeholders})`, ids)
  }

  await query('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
  await query('DELETE FROM conversations WHERE id = ?', [conversationId])

  return successResponse({ id: parseInt(conversationId) })
})
