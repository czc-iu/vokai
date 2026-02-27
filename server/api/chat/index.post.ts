import type { ChatInput } from '../../utils/validation'
import { validate, chatSchema } from '../../utils/validation'
import { requireAuth } from '../../utils/auth'
import { queryOne, query, insert } from '../../utils/db'
import { chatWithQwen, type QwenMessage } from '../../utils/ai'
import { getSkillsPrompt } from '../../utils/skills'
import { successResponse, throwBadRequest } from '../../utils/response'

interface DbConversation {
  id: number
  user_id: number
  title: string
}

interface DbMessage {
  id: number
  role: string
  content: string
  created_at: Date
}

interface ChatRequestBody {
  message: string
  conversationId?: number
  enableSearch?: boolean
  enableThinking?: boolean
}

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const validation = validate(chatSchema, body)
  if (!validation.success) {
    throwBadRequest(validation.error)
  }

  const { message, conversationId } = validation.data as ChatInput
  const { enableSearch, enableThinking } = (body as ChatRequestBody) || {}
  const userId = auth.userId

  let conversation: DbConversation | null = null

  if (conversationId) {
    conversation = await queryOne<DbConversation>(
      'SELECT id, user_id, title FROM conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    )
  }

  if (!conversation) {
    const result = await insert('conversations', {
      user_id: userId,
      title: message.slice(0, 50),
      model: 'qwen-plus'
    })
    conversation = {
      id: result.insertId,
      user_id: userId,
      title: message.slice(0, 50)
    }
  }

  await insert('messages', {
    conversation_id: conversation.id,
    role: 'user',
    content: message
  })

  const historyMessages = await query<DbMessage[]>(
    'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 20',
    [conversation.id]
  )

  const aiMessages: QwenMessage[] = historyMessages.map((m: DbMessage) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content
  }))

  let skillsPrompt = ''
  try {
    skillsPrompt = await getSkillsPrompt()
  } catch (error) {
    console.error('Skills prompt error:', error)
  }

  const aiResponse = await chatWithQwen(aiMessages, {
    enableSearch,
    enableThinking,
    additionalSystemPrompt: skillsPrompt
  })

  const responseContent = aiResponse.content || '抱歉，我暂时无法回答这个问题。'

  await insert('messages', {
    conversation_id: conversation.id,
    role: 'assistant',
    content: responseContent
  })

  return successResponse({
    conversationId: conversation.id,
    message: responseContent,
    reasoningContent: aiResponse.reasoningContent
  })
})
