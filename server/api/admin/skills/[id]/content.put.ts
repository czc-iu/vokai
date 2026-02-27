import { requireAdmin } from '../../../../utils/adminAuth'
import { getSkill, saveSkillFileContent, updateSkill, loadSkillDefinition } from '../../../../utils/skills'
import { successResponse, throwNotFound, throwBadRequest } from '../../../../utils/response'

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
  const { content } = body

  if (!content || typeof content !== 'string') {
    throwBadRequest('内容不能为空')
  }

  saveSkillFileContent(skill.path, 'SKILL.md', content)

  const definition = await loadSkillDefinition(skill.path)
  if (definition) {
    await updateSkill(parseInt(id), {
      name: definition.name || skill.path,
      description: definition.description
    })
  }

  return successResponse({ saved: true })
})
