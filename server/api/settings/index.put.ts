import { requireAuth } from '~/server/utils/auth'
import { updateUserSettings } from '~/server/utils/userSettings'
import { successResponse } from '~/server/utils/response'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  enableRag: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const validation = updateSettingsSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0]?.message || 'Invalid input'
    })
  }

  const settings = await updateUserSettings(auth.userId, validation.data)

  return successResponse(settings)
})