import { successResponse } from '~/server/utils/response'
import { requireAuth } from '~/server/utils/auth'
import { getUserMemberInfo, redeemPointsForTokens } from '~/server/utils/membership'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { points } = body
  
  if (!points || typeof points !== 'number' || points <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid points amount'
    })
  }
  
  try {
    const result = await redeemPointsForTokens(user.userId, points)
    
    const memberInfo = await getUserMemberInfo(user.userId)
    
    return successResponse({
      pointsRedeemed: result.pointsRedeemed,
      tokensReceived: result.tokensReceived,
      currentPoints: memberInfo.points,
      memberLevel: memberInfo.memberLevel
    })
  } catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || 'Failed to redeem points'
    })
  }
})
