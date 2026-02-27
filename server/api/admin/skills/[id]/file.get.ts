import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, getSkillFileContent } from '../../../../utils/skills'
import { successResponse, throwNotFound, throwBadRequest } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const filePath = query.file as string

  if (!id) {
    throwNotFound('技能不存在')
  }

  if (!filePath) {
    throwBadRequest('文件路径不能为空')
  }

  const skill = await getSkill(parseInt(id))
  if (!skill) {
    throwNotFound('技能不存在')
  }

  const content = getSkillFileContent(skill.path, filePath)
  if (content === null) {
    throwNotFound('文件不存在')
  }

  return successResponse({
    content,
    path: filePath,
    skillName: skill.name
  })
})
