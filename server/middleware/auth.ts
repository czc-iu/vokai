import { verifyToken, extractTokenFromHeader } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  const token = extractTokenFromHeader(authHeader)
  
  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      event.context.auth = payload
    }
  }
})
