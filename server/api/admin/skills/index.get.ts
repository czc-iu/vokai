import { requireAdmin } from '../../../utils/adminAuth'
import { getAllSkills } from '../../../utils/skills'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const skills = await getAllSkills()
  return successResponse(skills)
})
