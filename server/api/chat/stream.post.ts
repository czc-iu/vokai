import type { ChatInput } from '../../utils/validation'
import { validate, chatSchema } from '../../utils/validation'
import { requireAuth } from '../../utils/auth'
import { queryOne, query, insert } from '../../utils/db'
import { streamChatWithQwen, type QwenMessage } from '../../utils/ai'
import { getRAGContext } from '../../utils/rag'
import { getUserRAGContext } from '../../utils/userRag'
import { getUserMemories, formatMemoriesForPrompt, extractMemoriesFromConversation } from '../../utils/memory'
import { throwBadRequest } from '../../utils/response'
import { consumeTokens, recordDailyConsumption, getBalance } from '../../utils/billing'
import { calculateMessageTokens } from '../../utils/tokenCalculator'

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

  // 检查用户余额
  const balance = await getBalance(userId)
  if (balance <= 0) {
    throw createError({
      statusCode: 402,
      message: '当前tokens余额不足，请充值后继续使用'
    })
  }

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

  let ragContext = ''
  try {
    ragContext = await getRAGContext(message, 1000)
  } catch (error) {
    console.error('RAG context error:', error)
  }

  let userRagContext = ''
  try {
    userRagContext = await getUserRAGContext(userId, message, 1000)
  } catch (error) {
    console.error('User RAG context error:', error)
  }

  let memoryContext = ''
  try {
    const memories = await getUserMemories(userId)
    memoryContext = formatMemoriesForPrompt(memories)
  } catch (error) {
    console.error('Memory context error:', error)
  }

  let contextPrefix = ''
  if (memoryContext) {
    contextPrefix += memoryContext + '\n\n'
  }
  if (ragContext) {
    contextPrefix += ragContext + '\n\n'
  }
  if (userRagContext) {
    contextPrefix += userRagContext + '\n\n'
  }

  if (contextPrefix) {
    const lastUserMsgIdx = aiMessages.map((m) => m.role).lastIndexOf('user')
    if (lastUserMsgIdx !== -1) {
      aiMessages[lastUserMsgIdx] = {
        ...aiMessages[lastUserMsgIdx],
        content: `${contextPrefix}用户问题：${aiMessages[lastUserMsgIdx].content}`
      }
    }
  }

  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      let fullContent = ''
      let fullReasoning = ''

      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      sendEvent({
        type: 'conversation',
        conversationId: conversation!.id
      })

      try {
        for await (const chunk of streamChatWithQwen(aiMessages, {
          enableSearch,
          enableThinking
        })) {
          if (chunk.done) {
            break
          }

          if (chunk.content) {
            fullContent += chunk.content
            sendEvent({ type: 'content', content: chunk.content })
          }

          if (chunk.reasoningContent) {
            fullReasoning += chunk.reasoningContent
            sendEvent({ type: 'reasoning', content: chunk.reasoningContent })
          }
        }

        const responseContent = fullContent || '抱歉，我暂时无法回答这个问题。'
        
        const { inputTokens, outputTokens, totalTokens } = calculateMessageTokens(
          message,
          responseContent
        )
        
        await insert('messages', {
          conversation_id: conversation!.id,
          role: 'assistant',
          content: responseContent,
          tokens: totalTokens
        })

        await consumeTokens(
          userId,
          totalTokens,
          `对话消耗 (输入: ${inputTokens}, 输出: ${outputTokens})`,
          'conversation',
          conversation!.id
        )

        await recordDailyConsumption(userId, totalTokens, 1)

        extractMemoriesFromConversation(userId, [
          ...aiMessages,
          { role: 'assistant', content: responseContent }
        ]).catch((err) => console.error('Memory extraction error:', err))

        sendEvent({ 
          type: 'tokens', 
          inputTokens,
          outputTokens,
          totalTokens 
        })
        sendEvent({ type: 'done' })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'AI服务暂时不可用'
        sendEvent({ type: 'error', message: errorMessage })
      }

      controller.close()
    }
  })

  return sendStream(event, stream)
})
