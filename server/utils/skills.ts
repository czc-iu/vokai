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

export interface RemoteSkill {
  id: string
  skillId: string
  name: string
  source: string
  installs: number
}

export interface SkillDefinition {
  name: string
  description: string
  license?: string
  metadata?: Record<string, string>
}

export interface SkillFile {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  modifiedAt?: Date
}

function getConfig() {
  const config = useRuntimeConfig()
  return {
    skillsPath: (config.skillsPath as string) || './skills',
    agentsSkillsPath: path.join(process.cwd(), '.agents', 'skills')
  }
}

export function getSkillDirectory(skillPath: string): string | null {
  const { skillsPath, agentsSkillsPath } = getConfig()
  
  const primaryDir = path.join(skillsPath, skillPath)
  if (fs.existsSync(primaryDir)) {
    return primaryDir
  }
  
  const agentsDir = path.join(agentsSkillsPath, skillPath)
  if (fs.existsSync(agentsDir)) {
    return agentsDir
  }
  
  return null
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

function parseSkillFrontmatter(content: string): SkillDefinition | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  
  if (!frontmatterMatch) {
    return null
  }
  
  const frontmatter = frontmatterMatch[1]
  const body = frontmatterMatch[2]
  
  const definition: SkillDefinition = {
    name: '',
    description: ''
  }
  
  const lines = frontmatter.split('\n')
  let inMetadata = false
  const metadata: Record<string, string> = {}
  
  for (const line of lines) {
    const keyValueMatch = line.match(/^(\w+):\s*(.*)$/)
    if (keyValueMatch) {
      const key = keyValueMatch[1]
      const value = keyValueMatch[2].trim().replace(/^["']|["']$/g, '')
      
      if (key === 'metadata') {
        inMetadata = true
        continue
      }
      
      if (inMetadata && line.startsWith('  ')) {
        const metaMatch = line.match(/^\s+(\w+):\s*(.*)$/)
        if (metaMatch) {
          metadata[metaMatch[1]] = metaMatch[2].trim().replace(/^["']|["']$/g, '')
        }
        continue
      }
      
      inMetadata = false
      
      switch (key) {
        case 'name':
          definition.name = value
          break
        case 'description':
          definition.description = value
          break
        case 'license':
          definition.license = value
          break
      }
    } else if (!line.trim() || line.startsWith(' ')) {
      continue
    } else {
      inMetadata = false
    }
  }
  
  if (Object.keys(metadata).length > 0) {
    definition.metadata = metadata
  }
  
  if (!definition.description && body) {
    const firstLine = body.split('\n').find(l => l.trim() && !l.startsWith('#'))
    if (firstLine) {
      definition.description = firstLine.trim().substring(0, 200)
    }
  }
  
  return definition
}

export async function loadSkillDefinition(skillPath: string): Promise<SkillDefinition | null> {
  const skillDir = getSkillDirectory(skillPath)
  if (!skillDir) {
    return null
  }
  
  const skillFile = path.join(skillDir, 'SKILL.md')
  if (!fs.existsSync(skillFile)) {
    return {
      name: skillPath,
      description: ''
    }
  }
  
  const content = fs.readFileSync(skillFile, 'utf-8')
  const definition = parseSkillFrontmatter(content)
  
  if (definition) {
    return definition
  }
  
  return {
    name: skillPath,
    description: ''
  }
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
  const { skillsPath, agentsSkillsPath } = getConfig()
  const errors: string[] = []
  let found = 0
  let installed = 0

  if (!fs.existsSync(skillsPath)) {
    fs.mkdirSync(skillsPath, { recursive: true })
  }

  const existingSkills = await getAllSkills()
  const existingPaths = new Set(existingSkills.map((s) => s.path))

  const scanDirectory = (dirPath: string): string[] => {
    if (!fs.existsSync(dirPath)) return []
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  }

  const skillsDirs = scanDirectory(skillsPath)
  const agentsDirs = scanDirectory(agentsSkillsPath)
  const allDirs = [...new Set([...skillsDirs, ...agentsDirs])]

  for (const dir of allDirs) {
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

  return parts.join('\n')
}

export async function getSkillsPrompt(): Promise<string> {
  const skills = await getEnabledSkills()
  if (skills.length === 0) return ''

  const promptParts: string[] = ['已安装的技能：']

  for (const skill of skills) {
    const skillDir = getSkillDirectory(skill.path)
    if (!skillDir) continue
    
    const skillFile = path.join(skillDir, 'SKILL.md')
    if (fs.existsSync(skillFile)) {
      const content = fs.readFileSync(skillFile, 'utf-8')
      const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n?/, '')
      if (bodyContent.trim()) {
        promptParts.push(`\n## ${skill.name}\n${bodyContent.trim()}`)
      } else {
        promptParts.push(formatSkillPrompt({ name: skill.name, description: skill.description || '' }))
      }
    } else {
      promptParts.push(formatSkillPrompt({ name: skill.name, description: skill.description || '' }))
    }
  }

  return promptParts.join('\n')
}

export function listSkillFiles(skillPath: string, subPath: string = ''): SkillFile[] {
  const skillDir = getSkillDirectory(skillPath)
  if (!skillDir) {
    return []
  }
  
  const targetDir = subPath ? path.join(skillDir, subPath) : skillDir
  
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    return []
  }
  
  const items = fs.readdirSync(targetDir, { withFileTypes: true })
  
  return items
    .filter(item => !item.name.startsWith('.'))
    .map(item => {
      const fullPath = path.join(targetDir, item.name)
      const stat = fs.statSync(fullPath)
      
      return {
        name: item.name,
        path: subPath ? `${subPath}/${item.name}` : item.name,
        type: (item.isDirectory() ? 'directory' : 'file') as 'file' | 'directory',
        size: item.isFile() ? stat.size : undefined,
        modifiedAt: stat.mtime
      }
    })
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
}

export function getSkillFileContent(skillPath: string, filePath: string): string | null {
  const skillDir = getSkillDirectory(skillPath)
  if (!skillDir) {
    return null
  }
  
  const fullPath = path.join(skillDir, filePath)
  
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return null
  }
  
  if (!fullPath.startsWith(skillDir)) {
    return null
  }
  
  return fs.readFileSync(fullPath, 'utf-8')
}

export function saveSkillFileContent(skillPath: string, filePath: string, content: string): boolean {
  const skillDir = getSkillDirectory(skillPath)
  if (!skillDir) {
    return false
  }
  
  const fullPath = path.join(skillDir, filePath)
  
  if (!fullPath.startsWith(skillDir)) {
    return false
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8')
  return true
}

export function createSkillFile(skillPath: string, filePath: string, isDirectory: boolean = false): boolean {
  const skillDir = getSkillDirectory(skillPath)
  if (!skillDir) {
    return false
  }
  
  const fullPath = path.join(skillDir, filePath)
  
  if (!fullPath.startsWith(skillDir)) {
    return false
  }
  
  if (fs.existsSync(fullPath)) {
    return false
  }
  
  if (isDirectory) {
    fs.mkdirSync(fullPath, { recursive: true })
  } else {
    const dir = path.dirname(fullPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(fullPath, '', 'utf-8')
  }
  
  return true
}

export function deleteSkillFile(skillPath: string, filePath: string): boolean {
  const skillDir = getSkillDirectory(skillPath)
  if (!skillDir) {
    return false
  }
  
  const fullPath = path.join(skillDir, filePath)
  
  if (!fullPath.startsWith(skillDir)) {
    return false
  }
  
  if (!fs.existsSync(fullPath)) {
    return false
  }
  
  const stat = fs.statSync(fullPath)
  if (stat.isDirectory()) {
    fs.rmSync(fullPath, { recursive: true })
  } else {
    fs.unlinkSync(fullPath)
  }
  
  return true
}

export async function searchRemoteSkills(keyword: string): Promise<RemoteSkill[]> {
  try {
    const response = await fetch(`https://skills.sh/api/search?q=${encodeURIComponent(keyword)}&limit=50`)
    if (!response.ok) {
      throw new Error('Failed to search skills')
    }
    const data = await response.json()
    return data.skills || []
  } catch (error) {
    console.error('Failed to search remote skills:', error)
    return []
  }
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '').replace(/\x1b\].*?\x07/g, '')
}

export async function installRemoteSkill(skillId: string): Promise<{ success: boolean; message: string; output: string }> {
  try {
    const { execSync } = await import('child_process')
    
    const command = `npx --yes skills add --yes ${skillId}`
    const stdout = execSync(command, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      timeout: 120000,
      env: { ...process.env, DISABLE_TELEMETRY: '1', NO_COLOR: '1', TERM: 'dumb' }
    })
    
    console.log('Skill install output:', stdout)
    
    return { 
      success: true, 
      message: '安装完成，请点击"扫描技能"按钮刷新列表', 
      output: stripAnsi(stdout) 
    }
  } catch (error: any) {
    const stdout = error.stdout?.toString() || ''
    const stderr = error.stderr?.toString() || ''
    const output = stdout + (stderr ? '\n' + stderr : '')
    
    console.error('Skill install failed:', { stdout, stderr, message: error.message })
    
    return { 
      success: false, 
      message: '安装过程中发生错误，请查看输出日志', 
      output: stripAnsi(output) || error.message || 'Unknown error' 
    }
  }
}
