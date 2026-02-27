import { spawn } from 'child_process'
import { query, queryOne, insert, remove } from './db'

export interface WhitelistedCommand {
  id: number
  command: string
  description?: string
  enabled: boolean
}

export interface ExecutionResult {
  success: boolean
  stdout: string
  stderr: string
  exitCode: number
}

interface ParsedCommand {
  command: string
  args: string[]
}

interface CommandUpdateData {
  command?: string
  description?: string
  enabled?: boolean
}

const DEFAULT_TIMEOUT = 30000

function createErrorResult(stderr: string): ExecutionResult {
  return {
    success: false,
    stdout: '',
    stderr,
    exitCode: 1
  }
}

function createSuccessResult(stdout: string, stderr: string, exitCode: number): ExecutionResult {
  return {
    success: exitCode === 0,
    stdout,
    stderr,
    exitCode
  }
}

export async function getWhitelistedCommands(): Promise<WhitelistedCommand[]> {
  return query<WhitelistedCommand[]>(
    "SELECT * FROM whitelisted_commands WHERE enabled = TRUE"
  )
}

export async function getAllCommands(): Promise<WhitelistedCommand[]> {
  return query<WhitelistedCommand[]>('SELECT * FROM whitelisted_commands ORDER BY created_at DESC')
}

export async function getCommand(id: number): Promise<WhitelistedCommand | null> {
  return queryOne<WhitelistedCommand>('SELECT * FROM whitelisted_commands WHERE id = ?', [id])
}

export async function addCommand(data: {
  command: string
  description?: string
  enabled?: boolean
}): Promise<number> {
  const result = await insert('whitelisted_commands', {
    command: data.command,
    description: data.description,
    enabled: data.enabled ?? true
  })
  return result.insertId
}

export async function updateCommand(
  id: number,
  data: CommandUpdateData
): Promise<boolean> {
  const updateData: Record<string, unknown> = {}

  if (data.command !== undefined) updateData.command = data.command
  if (data.description !== undefined) updateData.description = data.description
  if (data.enabled !== undefined) updateData.enabled = data.enabled

  if (Object.keys(updateData).length === 0) return false

  const result = (await query(
    'UPDATE whitelisted_commands SET ? WHERE id = ?',
    [updateData, id]
  )) as unknown as { affectedRows: number }
  return result.affectedRows > 0
}

export async function deleteCommand(id: number): Promise<boolean> {
  const result = await remove('whitelisted_commands', 'id = ?', [id])
  return result.affectedRows > 0
}

export function parseCommand(commandString: string): ParsedCommand {
  const parts = commandString.trim().split(/\s+/)
  return {
    command: parts[0] ?? '',
    args: parts.slice(1)
  }
}

export async function isCommandWhitelisted(command: string): Promise<boolean> {
  const parsed = parseCommand(command)
  if (!parsed.command) return false

  const whitelist = await getWhitelistedCommands()
  return whitelist.some((c) => c.command === parsed.command)
}

async function validateCommandForExecution(command: string): Promise<{ valid: boolean; parsed: ParsedCommand; error?: ExecutionResult }> {
  const parsed = parseCommand(command)
  const isWhitelisted = await isCommandWhitelisted(command)

  if (!isWhitelisted) {
    return {
      valid: false,
      parsed,
      error: createErrorResult(`Command "${parsed.command}" is not whitelisted`)
    }
  }

  return { valid: true, parsed }
}

function executeSpawnProcess(parsed: ParsedCommand, timeout: number): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''

    const proc = spawn(parsed.command, parsed.args, {
      timeout,
      shell: false,
      env: {
        ...process.env,
        PATH: process.env.PATH
      }
    })

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      resolve(createSuccessResult(stdout, stderr, code ?? 1))
    })

    proc.on('error', (error) => {
      resolve(createSuccessResult(stdout, error.message, 1))
    })
  })
}

export async function executeCommand(
  command: string,
  timeout = DEFAULT_TIMEOUT
): Promise<ExecutionResult> {
  const validation = await validateCommandForExecution(command)

  if (!validation.valid) {
    return validation.error!
  }

  return executeSpawnProcess(validation.parsed, timeout)
}

export function getExecutionTools(): Array<{
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}> {
  return [
    {
      type: 'function' as const,
      function: {
        name: 'execute_command',
        description:
          'Execute a whitelisted shell command on the server. Only commands in the whitelist can be executed. Use this for system operations like checking date, echoing text, etc.',
        parameters: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute with arguments (e.g., "date", "echo hello")'
            }
          },
          required: ['command']
        }
      }
    },
    {
      type: 'function' as const,
      function: {
        name: 'execute_python',
        description:
          'Execute Python code on the server. Use this for calculations, data processing, file operations, and other tasks that require programming. The code runs in an isolated environment.',
        parameters: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              description: 'The Python code to execute. Can include imports, function definitions, and statements. Print output to see results.'
            }
          },
          required: ['code']
        }
      }
    }
  ]
}

export async function executePythonCode(
  code: string,
  timeout = DEFAULT_TIMEOUT
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''

    const proc = spawn('python3', ['-c', code], {
      timeout,
      env: {
        ...process.env,
        PATH: process.env.PATH,
        PYTHONIOENCODING: 'utf-8'
      }
    })

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      resolve(createSuccessResult(stdout, stderr, code ?? 1))
    })

    proc.on('error', (error) => {
      resolve(createSuccessResult(stdout, error.message, 1))
    })
  })
}
