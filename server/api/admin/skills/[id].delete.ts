import { requireAdmin } from '../../../utils/adminAuth'
import { deleteSkill } from '../../../utils/skills'
import { successResponse, throwNotFound } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('技能不存在')
  }

  const deleted = await deleteSkill(parseInt(id))

  if (!deleted) {
    throwNotFound('技能不存在')
  }

  return successResponse({ deleted: true })
})
