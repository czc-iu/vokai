import { requireAuth } from '../../utils/auth'
import { executeCommand, isCommandWhitelisted } from '../../utils/executor'
import { successResponse, throwBadRequest } from '../../utils/response'
import { z } from 'zod'

const executeSchema = z.object({
  command: z.string().min(1, '请输入命令')
})

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  const result = executeSchema.safeParse(body)
  if (!result.success) {
    throwBadRequest(result.error.errors[0]?.message || '验证失败')
  }

  const { command } = result.data

  const isAllowed = await isCommandWhitelisted(command)
  if (!isAllowed) {
    throwBadRequest('该命令不在白名单中，无法执行')
  }

  console.log(`User ${auth.userId} executing command: ${command}`)

  const executionResult = await executeCommand(command)

  return successResponse({
    command,
    ...executionResult
  })
})
