import { query, insert } from '~/server/utils/db'
import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'
import { indexUserDocument } from '~/server/utils/userRag'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  
  const { filename, content, description } = body
  
  if (!filename || !content) {
    throw createError({
      statusCode: 400,
      message: '文件名和内容不能为空'
    })
  }
  
  if (!filename.endsWith('.md')) {
    throw createError({
      statusCode: 400,
      message: '只支持 .md 文件'
    })
  }
  
  const existing = await query<any>(
    'SELECT id FROM user_documents WHERE user_id = ? AND filename = ?',
    [user.userId, filename]
  )
  
  if (existing.length > 0) {
    await query(
      'UPDATE user_documents SET content = ?, description = ?, is_indexed = FALSE, updated_at = NOW() WHERE user_id = ? AND filename = ?',
      [content, description || null, user.userId, filename]
    )
    
    await indexUserDocument(user.userId, filename, content)
    
    return successResponse({ message: '文档更新成功', updated: true })
  }
  
  await insert('user_documents', {
    user_id: user.userId,
    filename,
    content,
    description: description || null,
    is_indexed: false
  })
  
  await indexUserDocument(user.userId, filename, content)
  
  return successResponse({ message: '文档上传成功' })
})
