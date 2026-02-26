import { query, queryOne, insert } from './db'

export const MEMBER_LEVELS = {
  0: { name: 'Regular', minPoints: 0, maxConcurrent: 1 },
  1: { name: 'L1', minPoints: 2000, maxConcurrent: 5 },
  2: { name: 'L2', minPoints: 5000, maxConcurrent: 10 },
  3: { name: 'L3', minPoints: 10000, maxConcurrent: 20 },
  4: { name: 'L4', minPoints: 20000, maxConcurrent: 40 },
  5: { name: 'L5', minPoints: 50000, maxConcurrent: 60 },
  6: { name: 'L6', minPoints: 100000, maxConcurrent: 100 }
} as const

export const POINTS_PER_TOKEN = 100

export function calculateMemberLevel(points: number): number {
  if (points >= 100000) return 6
  if (points >= 50000) return 5
  if (points >= 20000) return 4
  if (points >= 10000) return 3
  if (points >= 5000) return 2
  if (points >= 2000) return 1
  return 0
}

export function getMemberLevelName(level: number): string {
  return MEMBER_LEVELS[level as keyof typeof MEMBER_LEVELS]?.name || 'Regular'
}

export function getMaxConcurrentSessions(level: number): number {
  return MEMBER_LEVELS[level as keyof typeof MEMBER_LEVELS]?.maxConcurrent || 1
}

export async function getUserMemberInfo(userId: number) {
  const user = await queryOne<{
    points: number
    member_level: number
    total_recharged: number
  }>(
    'SELECT points, member_level, total_recharged FROM users WHERE id = ?',
    [userId]
  )
  
  if (!user) {
    throw new Error('User not found')
  }
  
  const correctLevel = calculateMemberLevel(user.points)
  
  if (correctLevel !== user.member_level) {
    await query(
      'UPDATE users SET member_level = ? WHERE id = ?',
      [correctLevel, userId]
    )
    user.member_level = correctLevel
  }
  
  return {
    points: user.points,
    memberLevel: user.member_level,
    levelName: getMemberLevelName(user.member_level),
    maxConcurrent: getMaxConcurrentSessions(user.member_level),
    totalRecharged: user.total_recharged,
    nextLevel: user.member_level < 6 ? {
      level: user.member_level + 1,
      name: getMemberLevelName(user.member_level + 1),
      pointsNeeded: MEMBER_LEVELS[(user.member_level + 1) as keyof typeof MEMBER_LEVELS].minPoints - user.points
    } : null
  }
}

export async function addPoints(
  userId: number,
  amount: number,
  type: 'earn' | 'redeem' | 'adjust',
  description?: string,
  referenceType?: string,
  referenceId?: number
) {
  const currentPoints = await queryOne<{ points: number }>(
    'SELECT points FROM users WHERE id = ? FOR UPDATE',
    [userId]
  )
  
  if (!currentPoints) {
    throw new Error('User not found')
  }
  
  const newPoints = currentPoints.points + amount
  const newLevel = calculateMemberLevel(newPoints)
  
  await query(
    'UPDATE users SET points = ?, member_level = ? WHERE id = ?',
    [newPoints, newLevel, userId]
  )
  
  await insert('point_transactions', {
    user_id: userId,
    type,
    amount,
    balance_after: newPoints,
    description,
    reference_type: referenceType,
    reference_id: referenceId
  })
  
  return {
    points: newPoints,
    memberLevel: newLevel
  }
}

export async function redeemPointsForTokens(userId: number, points: number) {
  const user = await queryOne<{ points: number }>(
    'SELECT points FROM users WHERE id = ? FOR UPDATE',
    [userId]
  )
  
  if (!user) {
    throw new Error('User not found')
  }
  
  if (user.points < points) {
    throw new Error('Insufficient points')
  }
  
  const tokens = points * POINTS_PER_TOKEN
  
  await addPoints(userId, -points, 'redeem', `Redeem ${tokens} tokens`, 'token_redemption')
  
  const { addTokens } = await import('./billing')
  await addTokens(userId, tokens, 'gift', `Redeemed from ${points} points`)
  
  return {
    pointsRedeemed: points,
    tokensReceived: tokens
  }
}

export async function checkConcurrentLimit(userId: number): Promise<boolean> {
  const memberInfo = await getUserMemberInfo(userId)
  
  const activeSessions = await query<{ count: number }[]>(
    'SELECT COUNT(*) as count FROM concurrent_sessions WHERE user_id = ? AND expires_at > NOW()',
    [userId]
  )
  
  const currentCount = activeSessions[0]?.count || 0
  
  return currentCount < memberInfo.maxConcurrent
}

export async function createConcurrentSession(userId: number, sessionId: string, durationMinutes: number = 60) {
  const canCreate = await checkConcurrentLimit(userId)
  
  if (!canCreate) {
    throw new Error('Concurrent session limit reached')
  }
  
  await insert('concurrent_sessions', {
    user_id: userId,
    session_id: sessionId,
    expires_at: new Date(Date.now() + durationMinutes * 60 * 1000)
  })
  
  return true
}

export async function removeConcurrentSession(sessionId: string) {
  await query(
    'DELETE FROM concurrent_sessions WHERE session_id = ?',
    [sessionId]
  )
}

export async function cleanupExpiredSessions() {
  await query('DELETE FROM concurrent_sessions WHERE expires_at < NOW()')
}
