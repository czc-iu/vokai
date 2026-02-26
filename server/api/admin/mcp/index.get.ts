import { requireAdmin } from '../../../utils/adminAuth'
import { getAllMcpServices } from '../../../utils/mcp'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const services = await getAllMcpServices()
  return successResponse(services)
})
