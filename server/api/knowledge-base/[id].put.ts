import { query, queryOne } from '~/server/utils/db'
import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'
import { indexUserDocument } from '~/server/utils/userRag'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const docId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!docId) {
    throw createError({
      statusCode: 400,
      message: '文档ID不能为空'
    })
  }
  
  const document = await queryOne<any>(
    'SELECT * FROM user_documents WHERE id = ? AND user_id = ?',
    [docId, user.userId]
  )
  
  if (!document) {
    throw createError({
      statusCode: 404,
      message: '文档不存在'
    })
  }
  
  const { filename, content, description } = body
  
  if (!filename || !content) {
    throw createError({
      statusCode: 400,
      message: '文件名和内容不能为空'
    })
  }
  
  await query(
    'UPDATE user_documents SET filename = ?, content = ?, description = ?, is_indexed = FALSE, updated_at = NOW() WHERE id = ?',
    [filename, content, description || null, docId]
  )
  
  await indexUserDocument(user.userId, filename, content)
  
  return successResponse({ message: '文档更新成功' })
})
