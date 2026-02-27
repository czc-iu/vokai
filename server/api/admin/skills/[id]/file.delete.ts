import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, deleteSkillFile } from '../../../../utils/skills'
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

  const deleted = deleteSkillFile(skill.path, filePath)
  if (!deleted) {
    throwBadRequest('删除失败，文件可能不存在')
  }

  return successResponse({ deleted: true })
})
