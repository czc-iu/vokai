import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'
import { getUserMemberInfo, MEMBER_LEVELS } from '~/server/utils/membership'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const memberInfo = await getUserMemberInfo(user.userId)
  
  const levels = Object.entries(MEMBER_LEVELS).map(([level, info]) => ({
    level: parseInt(level),
    name: info.name,
    minPoints: info.minPoints,
    maxConcurrent: info.maxConcurrent
  }))
  
  return successResponse({
    ...memberInfo,
    levels
  })
})
