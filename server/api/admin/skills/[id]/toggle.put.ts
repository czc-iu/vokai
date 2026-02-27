import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, updateSkill } from '../../../../utils/skills'
import { successResponse, throwNotFound } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')

  if (!id) {
    throwNotFound('技能不存在')
  }

  const skill = await getSkill(parseInt(id))
  if (!skill) {
    throwNotFound('技能不存在')
  }

  const body = await readBody(event)
  const { enabled } = body

  if (typeof enabled !== 'boolean') {
    await updateSkill(parseInt(id), { enabled: !skill.enabled })
  } else {
    await updateSkill(parseInt(id), { enabled })
  }

  return successResponse({ updated: true })
})
