import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFs = {
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn()
}

vi.mock('fs', () => ({
  default: mockFs,
  existsSync: mockFs.existsSync,
  mkdirSync: mockFs.mkdirSync,
  readdirSync: mockFs.readdirSync,
  readFileSync: mockFs.readFileSync
}))

vi.mock('path', () => ({
  default: {
    join: vi.fn((...args) => args.join('/'))
  }
}))

const mockQuery = vi.fn()
const mockQueryOne = vi.fn()
const mockInsert = vi.fn()
const mockRemove = vi.fn()

vi.mock('../utils/db', () => ({
  query: mockQuery,
  queryOne: mockQueryOne,
  insert: mockInsert,
  remove: mockRemove
}))

vi.stubGlobal('useRuntimeConfig', () => ({
  skillsPath: './skills'
}))

describe('Skills Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllSkills', () => {
    it('should return all skills', async () => {
      const mockSkills = [
        { id: 1, name: 'Skill 1', path: 'skill1', enabled: true },
        { id: 2, name: 'Skill 2', path: 'skill2', enabled: false }
      ]
      mockQuery.mockResolvedValue(mockSkills)

      const { getAllSkills } = await import('../utils/skills')
      const result = await getAllSkills()

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM skills ORDER BY created_at DESC')
      expect(result).toHaveLength(2)
    })

    it('should return empty array when no skills', async () => {
      mockQuery.mockResolvedValue([])

      const { getAllSkills } = await import('../utils/skills')
      const result = await getAllSkills()

      expect(result).toEqual([])
    })
  })

  describe('getEnabledSkills', () => {
    it('should return only enabled skills', async () => {
      const mockSkills = [
        { id: 1, name: 'Skill 1', path: 'skill1', enabled: true }
      ]
      mockQuery.mockResolvedValue(mockSkills)

      const { getEnabledSkills } = await import('../utils/skills')
      const result = await getEnabledSkills()

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM skills WHERE enabled = TRUE')
      expect(result).toHaveLength(1)
    })
  })

  describe('getSkill', () => {
    it('should return skill by id', async () => {
      const mockSkill = { id: 1, name: 'Skill 1', path: 'skill1', enabled: true }
      mockQueryOne.mockResolvedValue(mockSkill)

      const { getSkill } = await import('../utils/skills')
      const result = await getSkill(1)

      expect(mockQueryOne).toHaveBeenCalledWith('SELECT * FROM skills WHERE id = ?', [1])
      expect(result?.name).toBe('Skill 1')
    })

    it('should return null when skill not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getSkill } = await import('../utils/skills')
      const result = await getSkill(999)

      expect(result).toBeNull()
    })
  })

  describe('createSkill', () => {
    it('should create skill with all fields', async () => {
      mockInsert.mockResolvedValue({ insertId: 1 })

      const { createSkill } = await import('../utils/skills')
      const result = await createSkill({
        name: 'New Skill',
        path: 'new-skill',
        description: 'A new skill',
        enabled: true
      })

      expect(mockInsert).toHaveBeenCalledWith('skills', {
        name: 'New Skill',
        path: 'new-skill',
        description: 'A new skill',
        enabled: true
      })
      expect(result).toBe(1)
    })

    it('should create skill with default enabled value', async () => {
      mockInsert.mockResolvedValue({ insertId: 2 })

      const { createSkill } = await import('../utils/skills')
      const result = await createSkill({
        name: 'Skill',
        path: 'skill'
      })

      expect(mockInsert).toHaveBeenCalledWith('skills', {
        name: 'Skill',
        path: 'skill',
        description: undefined,
        enabled: true
      })
      expect(result).toBe(2)
    })

    it('should create disabled skill', async () => {
      mockInsert.mockResolvedValue({ insertId: 3 })

      const { createSkill } = await import('../utils/skills')
      await createSkill({
        name: 'Disabled Skill',
        path: 'disabled',
        enabled: false
      })

      expect(mockInsert).toHaveBeenCalledWith('skills', {
        name: 'Disabled Skill',
        path: 'disabled',
        description: undefined,
        enabled: false
      })
    })
  })

  describe('updateSkill', () => {
    it('should update skill fields', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { updateSkill } = await import('../utils/skills')
      const result = await updateSkill(1, { name: 'Updated Name', enabled: false })

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE skills SET ? WHERE id = ?',
        [{ name: 'Updated Name', enabled: false }, 1]
      )
      expect(result).toBe(true)
    })

    it('should return false when no fields to update', async () => {
      const { updateSkill } = await import('../utils/skills')
      const result = await updateSkill(1, {})

      expect(result).toBe(false)
      expect(mockQuery).not.toHaveBeenCalled()
    })

    it('should return false when skill not found', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 0 })

      const { updateSkill } = await import('../utils/skills')
      const result = await updateSkill(999, { name: 'New' })

      expect(result).toBe(false)
    })

    it('should only update provided fields', async () => {
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { updateSkill } = await import('../utils/skills')
      await updateSkill(1, { name: 'Only Name' })

      const callArgs = mockQuery.mock.calls[0][1][0]
      expect(callArgs).toEqual({ name: 'Only Name' })
      expect(callArgs.path).toBeUndefined()
      expect(callArgs.enabled).toBeUndefined()
    })
  })

  describe('deleteSkill', () => {
    it('should delete skill', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 1 })

      const { deleteSkill } = await import('../utils/skills')
      const result = await deleteSkill(1)

      expect(mockRemove).toHaveBeenCalledWith('skills', 'id = ?', [1])
      expect(result).toBe(true)
    })

    it('should return false when skill not found', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 0 })

      const { deleteSkill } = await import('../utils/skills')
      const result = await deleteSkill(999)

      expect(result).toBe(false)
    })
  })

  describe('loadSkillDefinition', () => {
    it('should parse SKILL.md file correctly', async () => {
      const skillContent = `# My Skill

> This is a skill description

## Triggers
- trigger one
- trigger two
* trigger three

## Instructions
Follow these instructions carefully.

## Other Section
This should not be parsed.`

      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(skillContent)

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('my-skill')

      expect(result?.name).toBe('My Skill')
      expect(result?.description).toBe('This is a skill description')
      expect(result?.triggers).toEqual(['trigger one', 'trigger two', 'trigger three'])
      expect(result?.instructions).toContain('Follow these instructions')
    })

    it('should return null when SKILL.md not found', async () => {
      mockFs.existsSync.mockReturnValue(false)

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('nonexistent')

      expect(result).toBeNull()
    })

    it('should handle missing name', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('> Description only')

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('skill')

      expect(result?.name).toBe('')
      expect(result?.description).toBe('Description only')
    })

    it('should handle missing description', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('# Skill Name\n\nSome content')

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('skill')

      expect(result?.name).toBe('Skill Name')
      expect(result?.description).toBe('')
    })

    it('should handle empty file', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('')

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('skill')

      expect(result?.name).toBe('')
      expect(result?.description).toBe('')
      expect(result?.triggers).toBeUndefined()
    })

    it('should handle file without triggers', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('# Skill\n> Desc\n\n## Instructions\nDo this.')

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('skill')

      expect(result?.triggers).toBeUndefined()
      expect(result?.instructions).toBe('Do this.')
    })

    it('should handle triggers with mixed list markers', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(`# Skill
> Desc

## Triggers
- dash item
* star item
  not a list item
- another dash`)

      const { loadSkillDefinition } = await import('../utils/skills')
      const result = await loadSkillDefinition('skill')

      expect(result?.triggers).toEqual(['dash item', 'star item', 'another dash'])
    })
  })

  describe('scanSkillsDirectory', () => {
    it('should create skills directory if not exists', async () => {
      mockFs.existsSync.mockReturnValue(false)
      mockFs.mkdirSync.mockReturnValue(undefined)

      const { scanSkillsDirectory } = await import('../utils/skills')
      const result = await scanSkillsDirectory()

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./skills', { recursive: true })
      expect(result.found).toBe(0)
      expect(result.errors).toContain('Skills directory created. Add skill directories with SKILL.md files.')
    })

    it('should scan and install new skills', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        { name: 'skill1', isDirectory: () => true },
        { name: 'skill2', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false }
      ])
      mockQuery.mockResolvedValueOnce([])
      mockFs.readFileSync
        .mockReturnValueOnce('# Skill 1\n> Description 1')
        .mockReturnValueOnce('# Skill 2\n> Description 2')
      mockInsert
        .mockResolvedValueOnce({ insertId: 1 })
        .mockResolvedValueOnce({ insertId: 2 })

      const { scanSkillsDirectory } = await import('../utils/skills')
      const result = await scanSkillsDirectory()

      expect(result.found).toBe(2)
      expect(result.installed).toBe(2)
    })

    it('should skip already installed skills', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        { name: 'existing-skill', isDirectory: () => true }
      ])
      mockQuery.mockResolvedValueOnce([
        { id: 1, path: 'existing-skill' }
      ])

      const { scanSkillsDirectory } = await import('../utils/skills')
      const result = await scanSkillsDirectory()

      expect(result.found).toBe(1)
      expect(result.installed).toBe(0)
    })

    it('should handle skill loading errors', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        { name: 'error-skill', isDirectory: () => true }
      ])
      mockQuery.mockResolvedValueOnce([])
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error')
      })

      const { scanSkillsDirectory } = await import('../utils/skills')
      const result = await scanSkillsDirectory()

      expect(result.found).toBe(1)
      expect(result.installed).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('error-skill')
    })

    it('should only scan directories', async () => {
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readdirSync.mockReturnValue([
        { name: 'real-skill', isDirectory: () => true },
        { name: 'file.md', isDirectory: () => false },
        { name: '.hidden', isDirectory: () => true }
      ])
      mockQuery.mockResolvedValueOnce([])
      mockFs.readFileSync.mockReturnValue('# Skill\n> Desc')
      mockInsert.mockResolvedValue({ insertId: 1 })

      const { scanSkillsDirectory } = await import('../utils/skills')
      const result = await scanSkillsDirectory()

      expect(result.found).toBe(2)
    })

    it('should skip skills without valid definition', async () => {
      mockFs.existsSync
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
      mockFs.readdirSync.mockReturnValue([
        { name: 'invalid-skill', isDirectory: () => true }
      ])
      mockQuery.mockResolvedValueOnce([])

      const { scanSkillsDirectory } = await import('../utils/skills')
      const result = await scanSkillsDirectory()

      expect(result.found).toBe(1)
      expect(result.installed).toBe(0)
    })
  })

  describe('getSkillsPrompt', () => {
    it('should return empty string when no enabled skills', async () => {
      mockQuery.mockResolvedValue([])

      const { getSkillsPrompt } = await import('../utils/skills')
      const result = await getSkillsPrompt()

      expect(result).toBe('')
    })

    it('should generate prompt from enabled skills', async () => {
      const mockSkills = [
        { id: 1, name: 'Skill 1', path: 'skill1', enabled: true }
      ]
      mockQuery.mockResolvedValue(mockSkills)
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue(`# Skill 1

> This is skill 1 description

## Instructions
Use this skill for X.`)

      const { getSkillsPrompt } = await import('../utils/skills')
      const result = await getSkillsPrompt()

      expect(result).toContain('已安装的技能')
      expect(result).toContain('Skill 1')
      expect(result).toContain('This is skill 1 description')
      expect(result).toContain('使用说明')
      expect(result).toContain('Use this skill for X')
    })

    it('should handle multiple skills', async () => {
      const mockSkills = [
        { id: 1, name: 'Skill 1', path: 'skill1', enabled: true },
        { id: 2, name: 'Skill 2', path: 'skill2', enabled: true }
      ]
      mockQuery.mockResolvedValue(mockSkills)
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync
        .mockReturnValueOnce('# Skill 1\n> Desc 1')
        .mockReturnValueOnce('# Skill 2\n> Desc 2')

      const { getSkillsPrompt } = await import('../utils/skills')
      const result = await getSkillsPrompt()

      expect(result).toContain('Skill 1')
      expect(result).toContain('Skill 2')
    })

    it('should handle skill without definition file', async () => {
      const mockSkills = [
        { id: 1, name: 'Skill 1', path: 'skill1', enabled: true }
      ]
      mockQuery.mockResolvedValue(mockSkills)
      mockFs.existsSync.mockReturnValue(false)

      const { getSkillsPrompt } = await import('../utils/skills')
      const result = await getSkillsPrompt()

      expect(result).toContain('已安装的技能')
    })

    it('should handle skill without instructions', async () => {
      const mockSkills = [
        { id: 1, name: 'Skill 1', path: 'skill1', enabled: true }
      ]
      mockQuery.mockResolvedValue(mockSkills)
      mockFs.existsSync.mockReturnValue(true)
      mockFs.readFileSync.mockReturnValue('# Skill 1\n> Description only')

      const { getSkillsPrompt } = await import('../utils/skills')
      const result = await getSkillsPrompt()

      expect(result).toContain('Skill 1')
      expect(result).not.toContain('使用说明')
    })
  })
})
