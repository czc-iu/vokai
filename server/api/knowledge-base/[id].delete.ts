import { queryOne, remove } from '~/server/utils/db'
import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'
import { deleteUserDocument } from '~/server/utils/userRag'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const docId = getRouterParam(event, 'id')
  
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
  
  await deleteUserDocument(user.userId, document.filename)
  
  await remove('user_documents', 'id = ?', [docId])
  
  return successResponse({ message: '文档删除成功' })
})
