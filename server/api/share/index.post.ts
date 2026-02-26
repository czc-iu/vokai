import { nanoid } from 'nanoid'
import { insert } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { messageId, content } = body

  if (!content) {
    return {
      success: false,
      error: '内容不能为空'
    }
  }

  const shareId = nanoid(10)

  try {
    await insert('shared_messages', {
      share_id: shareId,
      message_id: messageId || null,
      content: content,
      created_at: new Date()
    })

    return {
      success: true,
      data: {
        shareId
      }
    }
  } catch (error) {
    console.error('Failed to create share:', error)
    return {
      success: false,
      error: '分享失败'
    }
  }
})
