import { requireAdmin } from '../../../utils/adminAuth'
import { searchRemoteSkills } from '../../../utils/skills'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const query = getQuery(event)
  const keyword = (query.q as string) || ''

  const skills = await searchRemoteSkills(keyword)

  return successResponse(skills)
})
