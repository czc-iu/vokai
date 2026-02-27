import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, createSkillFile } from '../../../../utils/skills'
import { successResponse, throwNotFound, throwBadRequest } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { filePath, isDirectory } = body

  if (!id) {
    throwNotFound('技能不存在')
  }

  if (!filePath || typeof filePath !== 'string') {
    throwBadRequest('文件路径不能为空')
  }

  const skill = await getSkill(parseInt(id))
  if (!skill) {
    throwNotFound('技能不存在')
  }

  const created = createSkillFile(skill.path, filePath, isDirectory === true)
  if (!created) {
    throwBadRequest('创建失败，文件可能已存在')
  }

  return successResponse({ created: true })
})
