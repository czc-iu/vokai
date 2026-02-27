import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, getSkillFileContent } from '../../../../utils/skills'
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

  const content = getSkillFileContent(skill.path, 'SKILL.md')
  if (content === null) {
    throwNotFound('SKILL.md 文件不存在')
  }

  return successResponse({ 
    content,
    path: skill.path,
    name: skill.name
  })
})
