import { requireAuth } from '~/server/utils/auth'
import { getUserSettings } from '~/server/utils/userSettings'
import { successResponse } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)

  const settings = await getUserSettings(auth.userId)

  return successResponse(settings)
})