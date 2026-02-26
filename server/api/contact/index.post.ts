import type { ContactInput } from '../../utils/validation'
import { validate, contactSchema } from '../../utils/validation'
import { insert } from '../../utils/db'
import { successResponse, throwBadRequest } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const validation = validate(contactSchema, body)
  if (!validation.success) {
    throwBadRequest(validation.error)
  }

  const { name, email, phone, company, subject, message } = validation.data as ContactInput

  const clientIp = getHeader(event, 'x-forwarded-for') || 
                   getHeader(event, 'x-real-ip') || 
                   'unknown'
                   
  const userAgent = getHeader(event, 'user-agent') || 'unknown'
  const ipAddress = Array.isArray(clientIp) ? clientIp[0] : clientIp.split(',')[0]?.trim()

  await insert('contacts', {
    name,
    email,
    phone: phone || null,
    company: company || null,
    subject: subject || null,
    message,
    status: 'new',
    ip_address: ipAddress,
    user_agent: userAgent.slice(0, 500)
  })

  return successResponse(undefined)
})
