import fs from 'fs'
import path from 'path'
import { query, queryOne, insert, remove } from './db'

export interface Skill {
  id: number
  name: string
  path: string
  description?: string
  enabled: boolean
}

export interface SkillDefinition {
  name: string
  description: string
  triggers?: string[]
  instructions?: string
  tools?: string[]
}

function getConfig() {
  const config = useRuntimeConfig()
  return {
    skillsPath: (config.skillsPath as string) || './skills'
  }
}

export async function getAllSkills(): Promise<Skill[]> {
  return query<Skill[]>('SELECT * FROM skills ORDER BY created_at DESC')
}

export async function getEnabledSkills(): Promise<Skill[]> {
  return query<Skill[]>("SELECT * FROM skills WHERE enabled = TRUE")
}

export async function getSkill(id: number): Promise<Skill | null> {
  return queryOne<Skill>('SELECT * FROM skills WHERE id = ?', [id])
}

export async function createSkill(data: {
  name: string
  path: string
  description?: string
  enabled?: boolean
}): Promise<number> {
  const result = await insert('skills', {
    name: data.name,
    path: data.path,
    description: data.description,
    enabled: data.enabled ?? true
  })
  return result.insertId
}

export async function updateSkill(
  id: number,
  data: Partial<{
    name: string
    path: string
    description: string
    enabled: boolean
  }>
): Promise<boolean> {
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.path !== undefined) updateData.path = data.path
  if (data.description !== undefined) updateData.description = data.description
  if (data.enabled !== undefined) updateData.enabled = data.enabled

  if (Object.keys(updateData).length === 0) return false

  const result = (await query(
    'UPDATE skills SET ? WHERE id = ?',
    [updateData, id]
  )) as unknown as { affectedRows: number }
  return result.affectedRows > 0
}

export async function deleteSkill(id: number): Promise<boolean> {
  const result = await remove('skills', 'id = ?', [id])
  return result.affectedRows > 0
}

function extractSection(content: string, sectionName: string): string | undefined {
  const regex = new RegExp(`##\\s*${sectionName}\\s*\\n([\\s\\S]*?)(?=##|$)`, 'i')
  const match = content.match(regex)
  return match ? match[1].trim() : undefined
}

function extractListItems(content: string): string[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- ') || l.startsWith('* '))
    .map((l) => l.slice(2).trim())
}

function parseSkillContent(content: string): SkillDefinition {
  const definition: SkillDefinition = {
    name: '',
    description: ''
  }

  const nameMatch = content.match(/^#\s+(.+)$/m)
  if (nameMatch) {
    definition.name = nameMatch[1].trim()
  }

  const descMatch = content.match(/^>\s*(.+)$/m)
  if (descMatch) {
    definition.description = descMatch[1].trim()
  }

  const triggersContent = extractSection(content, 'Triggers')
  if (triggersContent) {
    definition.triggers = extractListItems(triggersContent)
  }

  const instructionsContent = extractSection(content, 'Instructions')
  if (instructionsContent) {
    definition.instructions = instructionsContent
  }

  return definition
}

export async function loadSkillDefinition(skillPath: string): Promise<SkillDefinition | null> {
  const { skillsPath } = getConfig()
  const skillFile = path.join(skillsPath, skillPath, 'SKILL.md')

  if (!fs.existsSync(skillFile)) {
    return null
  }

  const content = fs.readFileSync(skillFile, 'utf-8')
  return parseSkillContent(content)
}

async function installSkill(dir: string): Promise<boolean> {
  const definition = await loadSkillDefinition(dir)
  if (!definition) return false

  await createSkill({
    name: definition.name || dir,
    path: dir,
    description: definition.description
  })
  return true
}

export async function scanSkillsDirectory(): Promise<{ found: number; installed: number; errors: string[] }> {
  const { skillsPath } = getConfig()
  const errors: string[] = []
  let found = 0
  let installed = 0

  if (!fs.existsSync(skillsPath)) {
    fs.mkdirSync(skillsPath, { recursive: true })
    return { found: 0, installed: 0, errors: ['Skills directory created. Add skill directories with SKILL.md files.'] }
  }

  const existingSkills = await getAllSkills()
  const existingPaths = new Set(existingSkills.map((s) => s.path))

  const dirs = fs.readdirSync(skillsPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  for (const dir of dirs) {
    found++

    if (existingPaths.has(dir)) continue

    try {
      if (await installSkill(dir)) {
        installed++
      }
    } catch (error) {
      errors.push(`${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return { found, installed, errors }
}

function formatSkillPrompt(definition: SkillDefinition): string {
  const parts: string[] = [`\n### ${definition.name}`]

  if (definition.description) {
    parts.push(definition.description)
  }

  if (definition.instructions) {
    parts.push('\n使用说明：')
    parts.push(definition.instructions)
  }

  return parts.join('\n')
}

export async function getSkillsPrompt(): Promise<string> {
  const skills = await getEnabledSkills()
  if (skills.length === 0) return ''

  const promptParts: string[] = ['已安装的技能：\n']

  for (const skill of skills) {
    const definition = await loadSkillDefinition(skill.path)
    if (definition) {
      promptParts.push(formatSkillPrompt(definition))
    }
  }

  return promptParts.join('\n')
}
