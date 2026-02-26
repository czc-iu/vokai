import { requireAdmin } from '../../../utils/adminAuth'
import { scanSkillsDirectory } from '../../../utils/skills'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const result = await scanSkillsDirectory()
  return successResponse(result)
})
