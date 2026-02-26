import { getAllMcpServices } from '../../../utils/mcp'
import { successResponse } from '../../../utils/response'

export default defineEventHandler(async () => {
  const services = await getAllMcpServices()
  return successResponse(services)
})
