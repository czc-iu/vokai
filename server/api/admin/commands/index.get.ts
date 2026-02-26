import { requireAdmin } from '../../../utils/adminAuth'
import { getAllCommands } from '../../../utils/executor'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const commands = await getAllCommands()
  return successResponse(commands)
})
