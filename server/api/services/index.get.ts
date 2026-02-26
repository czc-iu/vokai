import { getAllServices } from '../../utils/services'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async () => {
  const services = await getAllServices(true)
  return successResponse(services)
})
