import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockQuery = vi.fn()
const mockQueryOne = vi.fn()
const mockInsert = vi.fn()
const mockRemove = vi.fn()

vi.mock('../utils/db', () => ({
  query: (...args: unknown[]) => mockQuery(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  insert: (...args: unknown[]) => mockInsert(...args),
  remove: (...args: unknown[]) => mockRemove(...args)
}))

describe('Memory Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getUserMemories', () => {
    it('should return user memories ordered by updated_at DESC', async () => {
      const mockMemories = [
        { id: 2, user_id: 1, key: 'city', value: 'Beijing', updated_at: new Date('2024-01-02') },
        { id: 1, user_id: 1, key: 'name', value: 'John', updated_at: new Date('2024-01-01') }
      ]
      mockQuery.mockResolvedValue(mockMemories)

      const { getUserMemories } = await import('../utils/memory')
      const result = await getUserMemories(1)

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user_memories WHERE user_id = ? ORDER BY updated_at DESC',
        [1]
      )
      expect(result).toEqual(mockMemories)
    })

    it('should return empty array when no memories', async () => {
      mockQuery.mockResolvedValue([])

      const { getUserMemories } = await import('../utils/memory')
      const result = await getUserMemories(1)

      expect(result).toEqual([])
    })
  })

  describe('getMemory', () => {
    it('should return specific memory by key', async () => {
      const mockMemory = {
        id: 1,
        user_id: 1,
        key: 'name',
        value: 'John',
        source: 'manual'
      }
      mockQueryOne.mockResolvedValue(mockMemory)

      const { getMemory } = await import('../utils/memory')
      const result = await getMemory(1, 'name')

      expect(mockQueryOne).toHaveBeenCalledWith(
        'SELECT * FROM user_memories WHERE user_id = ? AND `key` = ?',
        [1, 'name']
      )
      expect(result).toEqual(mockMemory)
    })

    it('should return null when memory not found', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getMemory } = await import('../utils/memory')
      const result = await getMemory(1, 'nonexistent')

      expect(result).toBeNull()
    })

    it('should handle keys with special characters', async () => {
      mockQueryOne.mockResolvedValue(null)

      const { getMemory } = await import('../utils/memory')
      await getMemory(1, 'email@address')

      expect(mockQueryOne).toHaveBeenCalledWith(
        'SELECT * FROM user_memories WHERE user_id = ? AND `key` = ?',
        [1, 'email@address']
      )
    })
  })

  describe('setMemory', () => {
    it('should create new memory when not exists', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { setMemory } = await import('../utils/memory')
      await setMemory(1, 'name', 'John', 'manual')

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: 'name',
        value: 'John',
        source: 'manual'
      })
    })

    it('should update existing memory', async () => {
      mockQueryOne.mockResolvedValue({ id: 1, user_id: 1, key: 'name', value: 'Old' })
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { setMemory } = await import('../utils/memory')
      await setMemory(1, 'name', 'New Name', 'auto')

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE user_memories SET value = ?, source = ?, updated_at = NOW() WHERE id = ?',
        ['New Name', 'auto', 1]
      )
    })

    it('should default to manual source', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { setMemory } = await import('../utils/memory')
      await setMemory(1, 'city', 'Shanghai')

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: 'city',
        value: 'Shanghai',
        source: 'manual'
      })
    })
  })

  describe('deleteMemory', () => {
    it('should delete memory and return true', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 1 })

      const { deleteMemory } = await import('../utils/memory')
      const result = await deleteMemory(1, 'name')

      expect(mockRemove).toHaveBeenCalledWith(
        'user_memories',
        'user_id = ? AND `key` = ?',
        [1, 'name']
      )
      expect(result).toBe(true)
    })

    it('should return false when memory not found', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 0 })

      const { deleteMemory } = await import('../utils/memory')
      const result = await deleteMemory(1, 'nonexistent')

      expect(result).toBe(false)
    })
  })

  describe('clearUserMemories', () => {
    it('should delete all memories for user', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 5 })

      const { clearUserMemories } = await import('../utils/memory')
      await clearUserMemories(1)

      expect(mockRemove).toHaveBeenCalledWith('user_memories', 'user_id = ?', [1])
    })

    it('should handle user with no memories', async () => {
      mockRemove.mockResolvedValue({ affectedRows: 0 })

      const { clearUserMemories } = await import('../utils/memory')
      await clearUserMemories(1)

      expect(mockRemove).toHaveBeenCalled()
    })
  })

  describe('formatMemoriesForPrompt', () => {
    it('should format memories as prompt string', async () => {
      const { formatMemoriesForPrompt } = await import('../utils/memory')
      const memories = [
        { id: 1, user_id: 1, key: 'name', value: 'John', source: 'manual' as const, created_at: new Date(), updated_at: new Date() },
        { id: 2, user_id: 1, key: 'city', value: 'Beijing', source: 'auto' as const, created_at: new Date(), updated_at: new Date() }
      ]

      const result = formatMemoriesForPrompt(memories)

      expect(result).toBe('用户信息：\n- name: John\n- city: Beijing')
    })

    it('should return empty string for empty memories', async () => {
      const { formatMemoriesForPrompt } = await import('../utils/memory')
      const result = formatMemoriesForPrompt([])

      expect(result).toBe('')
    })

    it('should handle single memory', async () => {
      const { formatMemoriesForPrompt } = await import('../utils/memory')
      const memories = [
        { id: 1, user_id: 1, key: 'name', value: 'John', source: 'manual' as const, created_at: new Date(), updated_at: new Date() }
      ]

      const result = formatMemoriesForPrompt(memories)

      expect(result).toBe('用户信息：\n- name: John')
    })

    it('should handle memory with special characters', async () => {
      const { formatMemoriesForPrompt } = await import('../utils/memory')
      const memories = [
        { id: 1, user_id: 1, key: 'email', value: 'test@example.com', source: 'auto' as const, created_at: new Date(), updated_at: new Date() }
      ]

      const result = formatMemoriesForPrompt(memories)

      expect(result).toContain('test@example.com')
    })
  })

  describe('parseMemoryCommand', () => {
    it('should parse /remember command', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('/remember name John')

      expect(result).toEqual({
        action: 'remember',
        key: 'name',
        value: 'John'
      })
    })

    it('should parse /forget command', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('/forget name')

      expect(result).toEqual({
        action: 'forget',
        key: 'name'
      })
    })

    it('should return null for non-command message', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('Hello, how are you?')

      expect(result).toBeNull()
    })

    it('should return null for incomplete /remember command', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('/remember name')

      expect(result).toBeNull()
    })

    it('should return null for incomplete /forget command', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('/forget')

      expect(result).toBeNull()
    })

    it('should handle case-insensitive commands', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('/REMEMBER name John')

      expect(result).toEqual({
        action: 'remember',
        key: 'name',
        value: 'John'
      })
    })

    it('should parse /remember with multi-word value', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('/remember city New York City')

      expect(result).toEqual({
        action: 'remember',
        key: 'city',
        value: 'New York City'
      })
    })

    it('should not parse command in middle of message', async () => {
      const { parseMemoryCommand } = await import('../utils/memory')
      const result = parseMemoryCommand('Please /remember name John')

      expect(result).toBeNull()
    })
  })

  describe('extractMemoriesFromConversation', () => {
    it('should extract name from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '你好，我叫张三' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '姓名',
        value: '张三',
        source: 'auto'
      })
    })

    it('should extract profession from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我是一名软件工程师' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '职业',
        value: '一名软件工程师',
        source: 'auto'
      })
    })

    it('should extract company from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我在阿里巴巴科技公司工作' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '公司',
        value: '阿里巴巴科技公司',
        source: 'auto'
      })
    })

    it('should extract email from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我的邮箱是 test@example.com' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '邮箱',
        value: 'test@example.com',
        source: 'auto'
      })
    })

    it('should extract phone from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我的电话是 138-1234-5678' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '电话',
        value: '138-1234-5678',
        source: 'auto'
      })
    })

    it('should extract city from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我住在北京' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '城市',
        value: '北京',
        source: 'auto'
      })
    })

    it('should extract preference from conversation', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我喜欢编程' }
      ])

      expect(mockInsert).toHaveBeenCalledWith('user_memories', {
        user_id: 1,
        key: '偏好',
        value: '编程',
        source: 'auto'
      })
    })

    it('should only process last 3 user messages', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我叫老张' },
        { role: 'user', content: '我叫张三' },
        { role: 'user', content: '我叫李四' },
        { role: 'user', content: '我叫王五' },
        { role: 'assistant', content: '你好' }
      ])

      const calls = mockInsert.mock.calls
      const names = calls.map(c => (c[1] as { value: string }).value)
      expect(names).toContain('王五')
      expect(names).toContain('李四')
      expect(names).toContain('张三')
      expect(names).not.toContain('老张')
    })

    it('should ignore assistant messages', async () => {
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'assistant', content: '我叫助手' },
        { role: 'user', content: '普通消息' }
      ])

      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should handle conversation with no user messages', async () => {
      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'assistant', content: 'Hello' }
      ])

      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should handle empty messages array', async () => {
      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [])

      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('should update existing memory instead of creating new', async () => {
      mockQueryOne.mockResolvedValue({ id: 1, user_id: 1, key: '姓名', value: 'Old Name' })
      mockQuery.mockResolvedValue({ affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我叫新名字' }
      ])

      expect(mockQuery).toHaveBeenCalledWith(
        'UPDATE user_memories SET value = ?, source = ?, updated_at = NOW() WHERE id = ?',
        ['新名字', 'auto', 1]
      )
    })

    it('should extract multiple memories from single message', async () => {
      mockQueryOne.mockResolvedValue(null)
      mockInsert.mockResolvedValue({ insertId: 1, affectedRows: 1 })

      const { extractMemoriesFromConversation } = await import('../utils/memory')
      await extractMemoriesFromConversation(1, [
        { role: 'user', content: '我叫张三，我喜欢编程' }
      ])

      expect(mockInsert).toHaveBeenCalledTimes(2)
    })
  })
})
