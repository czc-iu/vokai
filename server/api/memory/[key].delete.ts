import { requireAuth } from '../../utils/auth'
import { deleteMemory } from '../../utils/memory'
import { successResponse, throwNotFound } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const key = getRouterParam(event, 'key')

  if (!key) {
    throwNotFound('记忆项不存在')
  }

  const deleted = await deleteMemory(auth.userId, key as string)

  if (!deleted) {
    throwNotFound('记忆项不存在')
  }

  return successResponse({ deleted: true })
})
