import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, saveSkillFileContent, loadSkillDefinition, updateSkill } from '../../../../utils/skills'
import { successResponse, throwNotFound, throwBadRequest } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { filePath, content } = body

  if (!id) {
    throwNotFound('技能不存在')
  }

  if (!filePath || typeof filePath !== 'string') {
    throwBadRequest('文件路径不能为空')
  }

  if (typeof content !== 'string') {
    throwBadRequest('文件内容不能为空')
  }

  const skill = await getSkill(parseInt(id))
  if (!skill) {
    throwNotFound('技能不存在')
  }

  const saved = saveSkillFileContent(skill.path, filePath, content)
  if (!saved) {
    throwBadRequest('保存失败')
  }

  if (filePath === 'SKILL.md' || filePath.endsWith('/SKILL.md')) {
    const definition = await loadSkillDefinition(skill.path)
    if (definition) {
      await updateSkill(parseInt(id), {
        name: definition.name || skill.path,
        description: definition.description
      })
    }
  }

  return successResponse({ saved: true })
})
