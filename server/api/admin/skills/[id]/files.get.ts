import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, listSkillFiles } from '../../../../utils/skills'
import { successResponse, throwNotFound } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const subPath = (query.path as string) || ''

  if (!id) {
    throwNotFound('技能不存在')
  }

  const skill = await getSkill(parseInt(id))
  if (!skill) {
    throwNotFound('技能不存在')
  }

  const files = listSkillFiles(skill.path, subPath)

  return successResponse({
    skill: {
      id: skill.id,
      name: skill.name,
      path: skill.path
    },
    files,
    currentPath: subPath
  })
})
