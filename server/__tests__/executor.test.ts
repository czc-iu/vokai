import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { spawn } from 'child_process'

vi.mock('child_process', () => ({
  spawn: vi.fn()
}))

vi.mock('../utils/db', () => ({
  query: vi.fn(),
  queryOne: vi.fn(),
  insert: vi.fn(),
  remove: vi.fn()
}))

const { query, queryOne, insert, remove } = await import('../utils/db')

vi.stubGlobal('createError', (opts: { statusCode: number; message: string }) => {
  const error = new Error(opts.message)
  ;(error as unknown as { statusCode: number }).statusCode = opts.statusCode
  return error
})

describe('Executor Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getWhitelistedCommands', () => {
    it('should return only enabled commands', async () => {
      const mockCommands = [
        { id: 1, command: 'ls', description: 'List files', enabled: true },
        { id: 2, command: 'pwd', description: 'Print working directory', enabled: true }
      ]

      vi.mocked(query).mockResolvedValueOnce(mockCommands)

      const { getWhitelistedCommands } = await import('../utils/executor')
      const result = await getWhitelistedCommands()

      expect(result).toEqual(mockCommands)
      expect(query).toHaveBeenCalledWith(
        "SELECT * FROM whitelisted_commands WHERE enabled = TRUE"
      )
    })

    it('should return empty array when no enabled commands', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { getWhitelistedCommands } = await import('../utils/executor')
      const result = await getWhitelistedCommands()

      expect(result).toEqual([])
    })
  })

  describe('getAllCommands', () => {
    it('should return all commands ordered by created_at DESC', async () => {
      const mockCommands = [
        { id: 3, command: 'cat', description: 'Read file', enabled: true },
        { id: 2, command: 'ls', description: 'List files', enabled: false },
        { id: 1, command: 'pwd', description: 'Print directory', enabled: true }
      ]

      vi.mocked(query).mockResolvedValueOnce(mockCommands)

      const { getAllCommands } = await import('../utils/executor')
      const result = await getAllCommands()

      expect(result).toEqual(mockCommands)
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM whitelisted_commands ORDER BY created_at DESC'
      )
    })
  })

  describe('getCommand', () => {
    it('should return command by id', async () => {
      const mockCommand = {
        id: 1,
        command: 'ls',
        description: 'List files',
        enabled: true
      }

      vi.mocked(queryOne).mockResolvedValueOnce(mockCommand)

      const { getCommand } = await import('../utils/executor')
      const result = await getCommand(1)

      expect(result).toEqual(mockCommand)
      expect(queryOne).toHaveBeenCalledWith(
        'SELECT * FROM whitelisted_commands WHERE id = ?',
        [1]
      )
    })

    it('should return null when command not found', async () => {
      vi.mocked(queryOne).mockResolvedValueOnce(null)

      const { getCommand } = await import('../utils/executor')
      const result = await getCommand(999)

      expect(result).toBeNull()
    })
  })

  describe('addCommand', () => {
    it('should add command with all fields', async () => {
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 5, affectedRows: 1 })

      const { addCommand } = await import('../utils/executor')
      const result = await addCommand({
        command: 'grep',
        description: 'Search text',
        enabled: true
      })

      expect(result).toBe(5)
      expect(insert).toHaveBeenCalledWith('whitelisted_commands', {
        command: 'grep',
        description: 'Search text',
        enabled: true
      })
    })

    it('should add command with default enabled value', async () => {
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 6, affectedRows: 1 })

      const { addCommand } = await import('../utils/executor')
      await addCommand({
        command: 'echo',
        description: 'Print text'
      })

      expect(insert).toHaveBeenCalledWith('whitelisted_commands', {
        command: 'echo',
        description: 'Print text',
        enabled: true
      })
    })

    it('should add command without description', async () => {
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 7, affectedRows: 1 })

      const { addCommand } = await import('../utils/executor')
      await addCommand({
        command: 'date'
      })

      expect(insert).toHaveBeenCalledWith('whitelisted_commands', {
        command: 'date',
        description: undefined,
        enabled: true
      })
    })

    it('should add disabled command when specified', async () => {
      vi.mocked(insert).mockResolvedValueOnce({ insertId: 8, affectedRows: 1 })

      const { addCommand } = await import('../utils/executor')
      await addCommand({
        command: 'rm',
        description: 'Remove files',
        enabled: false
      })

      expect(insert).toHaveBeenCalledWith('whitelisted_commands', {
        command: 'rm',
        description: 'Remove files',
        enabled: false
      })
    })
  })

  describe('updateCommand', () => {
    it('should update command field', async () => {
      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })

      const { updateCommand } = await import('../utils/executor')
      const result = await updateCommand(1, { command: 'ls -la' })

      expect(result).toBe(true)
    })

    it('should update description field', async () => {
      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })

      const { updateCommand } = await import('../utils/executor')
      const result = await updateCommand(1, { description: 'New description' })

      expect(result).toBe(true)
    })

    it('should update enabled field', async () => {
      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })

      const { updateCommand } = await import('../utils/executor')
      const result = await updateCommand(1, { enabled: false })

      expect(result).toBe(true)
    })

    it('should update multiple fields', async () => {
      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 1 })

      const { updateCommand } = await import('../utils/executor')
      const result = await updateCommand(1, {
        command: 'newcmd',
        description: 'New desc',
        enabled: false
      })

      expect(result).toBe(true)
    })

    it('should return false when no fields to update', async () => {
      const { updateCommand } = await import('../utils/executor')
      const result = await updateCommand(1, {})

      expect(result).toBe(false)
      expect(query).not.toHaveBeenCalled()
    })

    it('should return false when command not found', async () => {
      vi.mocked(query).mockResolvedValueOnce({ affectedRows: 0 })

      const { updateCommand } = await import('../utils/executor')
      const result = await updateCommand(999, { command: 'test' })

      expect(result).toBe(false)
    })
  })

  describe('deleteCommand', () => {
    it('should delete command and return true', async () => {
      vi.mocked(remove).mockResolvedValueOnce({ affectedRows: 1 })

      const { deleteCommand } = await import('../utils/executor')
      const result = await deleteCommand(1)

      expect(result).toBe(true)
      expect(remove).toHaveBeenCalledWith(
        'whitelisted_commands',
        'id = ?',
        [1]
      )
    })

    it('should return false when command not found', async () => {
      vi.mocked(remove).mockResolvedValueOnce({ affectedRows: 0 })

      const { deleteCommand } = await import('../utils/executor')
      const result = await deleteCommand(999)

      expect(result).toBe(false)
    })
  })

  describe('parseCommand', () => {
    it('should parse simple command', async () => {
      const { parseCommand } = await import('../utils/executor')
      const result = parseCommand('ls')

      expect(result).toEqual({ command: 'ls', args: [] })
    })

    it('should parse command with arguments', async () => {
      const { parseCommand } = await import('../utils/executor')
      const result = parseCommand('ls -la /home')

      expect(result).toEqual({ command: 'ls', args: ['-la', '/home'] })
    })

    it('should handle multiple spaces between arguments', async () => {
      const { parseCommand } = await import('../utils/executor')
      const result = parseCommand('ls   -la    /home')

      expect(result).toEqual({ command: 'ls', args: ['-la', '/home'] })
    })

    it('should handle leading and trailing spaces', async () => {
      const { parseCommand } = await import('../utils/executor')
      const result = parseCommand('  ls -la  ')

      expect(result).toEqual({ command: 'ls', args: ['-la'] })
    })

    it('should return object with empty command for empty string', async () => {
      const { parseCommand } = await import('../utils/executor')
      const result = parseCommand('')

      expect(result).toEqual({ command: '', args: [] })
    })

    it('should return object with empty command for whitespace only string', async () => {
      const { parseCommand } = await import('../utils/executor')
      const result = parseCommand('   ')

      expect(result).toEqual({ command: '', args: [] })
    })
  })

  describe('isCommandWhitelisted', () => {
    it('should return true for whitelisted command', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true },
        { id: 2, command: 'pwd', description: 'Print directory', enabled: true }
      ])

      const { isCommandWhitelisted } = await import('../utils/executor')
      const result = await isCommandWhitelisted('ls -la')

      expect(result).toBe(true)
    })

    it('should return false for non-whitelisted command', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true }
      ])

      const { isCommandWhitelisted } = await import('../utils/executor')
      const result = await isCommandWhitelisted('rm -rf /')

      expect(result).toBe(false)
    })

    it('should return false for empty command', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { isCommandWhitelisted } = await import('../utils/executor')
      const result = await isCommandWhitelisted('')

      expect(result).toBe(false)
    })

    it('should match only command name, not arguments', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true }
      ])

      const { isCommandWhitelisted } = await import('../utils/executor')
      const result = await isCommandWhitelisted('ls -la /home/user')

      expect(result).toBe(true)
    })

    it('should return false when whitelist is empty', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { isCommandWhitelisted } = await import('../utils/executor')
      const result = await isCommandWhitelisted('ls')

      expect(result).toBe(false)
    })
  })

  describe('executeCommand', () => {
    it('should return error for non-whitelisted empty command', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('')

      expect(result.success).toBe(false)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not whitelisted')
    })

    it('should return error for non-whitelisted command', async () => {
      vi.mocked(query).mockResolvedValueOnce([])

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('rm -rf /')

      expect(result.success).toBe(false)
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('not whitelisted')
    })

    it('should execute whitelisted command successfully', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'echo', description: 'Print text', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('Hello World'))
        }) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('echo Hello World')

      expect(result.success).toBe(true)
      expect(result.stdout).toBe('Hello World')
      expect(result.exitCode).toBe(0)
    })

    it('should capture stderr output', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn((event, callback) => {
          if (event === 'data') callback(Buffer.from('Error message'))
        }) },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(1)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('ls /nonexistent')

      expect(result.success).toBe(false)
      expect(result.stderr).toBe('Error message')
      expect(result.exitCode).toBe(1)
    })

    it('should handle process error', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'nonexistent', description: 'Test', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('spawn nonexistent ENOENT')), 0)
          }
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('nonexistent')

      expect(result.success).toBe(false)
      expect(result.stderr).toBe('spawn nonexistent ENOENT')
      expect(result.exitCode).toBe(1)
    })

    it('should use custom timeout', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'sleep', description: 'Wait', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      await executeCommand('sleep 1', 60000)

      expect(spawn).toHaveBeenCalledWith(
        'sleep',
        ['1'],
        expect.objectContaining({ timeout: 60000 })
      )
    })

    it('should use default timeout of 30000ms', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      await executeCommand('ls')

      expect(spawn).toHaveBeenCalledWith(
        'ls',
        [],
        expect.objectContaining({ timeout: 30000 })
      )
    })

    it('should spawn with shell: false', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      await executeCommand('ls')

      expect(spawn).toHaveBeenCalledWith(
        'ls',
        [],
        expect.objectContaining({ shell: false })
      )
    })

    it('should handle null exit code', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'ls', description: 'List files', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn() },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(null)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('ls')

      expect(result.exitCode).toBe(1)
    })

    it('should capture combined stdout chunks', async () => {
      vi.mocked(query).mockResolvedValueOnce([
        { id: 1, command: 'cat', description: 'Read file', enabled: true }
      ])

      const mockProcess = {
        stdout: { on: vi.fn((event, callback) => {
          if (event === 'data') {
            callback(Buffer.from('Line 1\n'))
            callback(Buffer.from('Line 2\n'))
            callback(Buffer.from('Line 3'))
          }
        }) },
        stderr: { on: vi.fn() },
        on: vi.fn((event, callback) => {
          if (event === 'close') callback(0)
        })
      }

      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ReturnType<typeof spawn>)

      const { executeCommand } = await import('../utils/executor')
      const result = await executeCommand('cat file.txt')

      expect(result.stdout).toBe('Line 1\nLine 2\nLine 3')
    })
  })

  describe('getExecutionTools', () => {
    it('should return tool definitions for execute_command and execute_python', async () => {
      const { getExecutionTools } = await import('../utils/executor')
      const tools = getExecutionTools()

      expect(tools).toHaveLength(2)
      expect(tools[0].type).toBe('function')
      expect(tools[0].function.name).toBe('execute_command')
      expect(tools[0].function.parameters.type).toBe('object')
      expect(tools[0].function.parameters.required).toEqual(['command'])

      expect(tools[1].type).toBe('function')
      expect(tools[1].function.name).toBe('execute_python')
      expect(tools[1].function.parameters.required).toEqual(['code'])
    })

    it('should have correct parameter schema for execute_command', async () => {
      const { getExecutionTools } = await import('../utils/executor')
      const tools = getExecutionTools()
      const properties = tools[0].function.parameters.properties as Record<string, { type: string; description: string }>
      const commandParam = properties.command

      expect(commandParam.type).toBe('string')
      expect(commandParam.description).toContain('command')
    })

    it('should return consistent tool definition', async () => {
      const { getExecutionTools } = await import('../utils/executor')
      const tools1 = getExecutionTools()
      const tools2 = getExecutionTools()

      expect(tools1).toEqual(tools2)
    })
  })
})
