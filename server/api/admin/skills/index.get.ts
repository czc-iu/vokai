import { getAllSkills } from '../../../utils/skills'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  const skills = await getAllSkills()
  return successResponse(skills)
})
