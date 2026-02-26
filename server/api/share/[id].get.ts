import { queryOne } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const shareId = event.context.params?.id

  if (!shareId) {
    return {
      success: false,
      error: '分享ID无效'
    }
  }

  const share = await queryOne<{
    id: number
    share_id: string
    content: string
    view_count: number
    created_at: Date
  }>(
    'SELECT share_id, content, view_count, created_at FROM shared_messages WHERE share_id = ?',
    [shareId]
  )

  if (!share) {
    return {
      success: false,
      error: '分享内容不存在或已过期'
    }
  }

  return {
    success: true,
    data: {
      content: share.content,
      viewCount: share.view_count,
      createdAt: share.created_at
    }
  }
})
