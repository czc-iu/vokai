import type { QwenMessage } from '../../utils/ai'
import { streamChatWithQwen } from '../../utils/ai'
import { getRAGContext } from '../../utils/rag'
import { getSkillsPrompt } from '../../utils/skills'
import { queryOne } from '../../utils/db'

interface EmbedConfig {
  id: number
  user_id: number
  api_key: string
  is_active: boolean
  knowledge_base_enabled: boolean
  custom_prompt: string | null
}

async function validateApiKey(apiKey: string): Promise<EmbedConfig | null> {
  if (!apiKey) return null
  
  const config = await queryOne<EmbedConfig>(
    'SELECT * FROM embed_configs WHERE api_key = ? AND is_active = TRUE',
    [apiKey]
  )
  
  return config
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { message } = body
  
  const apiKey = getHeader(event, 'x-api-key') || ''
  
  const config = await validateApiKey(apiKey)
  
  if (!config && apiKey) {
    throw createError({
      statusCode: 401,
      message: 'Invalid API key'
    })
  }
  
  if (!message || typeof message !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Message is required'
    })
  }

  const systemPrompt = config?.custom_prompt || 
    '你是TomyBot智能助手，一个专业、友好、高效的客服AI。请用简洁、专业的语言回答用户问题。'

  let skillsPrompt = ''
  try {
    skillsPrompt = await getSkillsPrompt()
  } catch (error) {
    console.error('Skills prompt error:', error)
  }

  const aiMessages: QwenMessage[] = [
    { role: 'user', content: message }
  ]

  if (config?.knowledge_base_enabled) {
    try {
      const ragContext = await getRAGContext(message, 1000)
      if (ragContext) {
        aiMessages[0].content = `${ragContext}\n\n用户问题：${message}`
      }
    } catch (error) {
      console.error('RAG context error:', error)
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

      const sendEvent = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        for await (const chunk of streamChatWithQwen(aiMessages, {
          enableSearch: false,
          enableThinking: false,
          additionalSystemPrompt: systemPrompt + (skillsPrompt ? '\n\n' + skillsPrompt : '')
        })) {
          if (chunk.done) {
            break
          }

          if (chunk.content) {
            sendEvent({ type: 'content', content: chunk.content })
          }
        }

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
