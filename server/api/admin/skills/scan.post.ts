import { scanSkillsDirectory } from '../../../utils/skills'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  const result = await scanSkillsDirectory()
  return successResponse(result)
})
