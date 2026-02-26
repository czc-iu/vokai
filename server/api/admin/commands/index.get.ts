import { getAllCommands } from '../../../utils/executor'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  const commands = await getAllCommands()
  return successResponse(commands)
})
