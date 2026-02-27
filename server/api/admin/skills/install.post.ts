import { requireAdmin } from '../../../utils/adminAuth'
import { installRemoteSkill } from '../../../utils/skills'
import { successResponse, throwBadRequest } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const body = await readBody(event)
  const { skillId } = body

  if (!skillId || typeof skillId !== 'string') {
    throwBadRequest('技能ID不能为空')
  }

  const result = await installRemoteSkill(skillId)

  return successResponse({ 
    success: result.success, 
    message: result.message,
    output: result.output
  })
})
