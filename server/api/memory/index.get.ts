import { requireAuth } from '../../utils/auth'
import { getUserMemories } from '../../utils/memory'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const memories = await getUserMemories(auth.userId)

  return successResponse(memories)
})
