import { requireAdmin, logAdminAction } from '../../../../utils/adminAuth'
import { getUserAdmin, adjustUserBalance } from '../../../../utils/adminUsers'
import { successResponse, errorResponse, throwNotFound } from '../../../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = parseInt(getRouterParam(event, 'id') || '0')
  if (!id) {
    throwNotFound('用户不存在')
  }

  const existing = await getUserAdmin(id)
  if (!existing) {
    throwNotFound('用户不存在')
  }

  const body = await readBody(event)
  const amount = parseInt(body.amount as string)
  const type = body.type as 'purchase' | 'consume' | 'refund' | 'gift'
  const description = body.description as string

  if (isNaN(amount)) {
    return errorResponse('请输入有效的数量')
  }

  if (!['purchase', 'consume', 'refund', 'gift'].includes(type)) {
    return errorResponse('无效的类型')
  }

  try {
    const result = await adjustUserBalance(id, amount, type, description || '管理员调整')

    if (!result.success) {
      return errorResponse('余额不足，扣减失败')
    }

    await logAdminAction(
      admin.adminId,
      'adjust_user_balance',
      { userId: id, amount, type, description, newBalance: result.newBalance },
      'user',
      id
    )

    return successResponse({
      message: '余额调整成功',
      newBalance: result.newBalance
    })
  } catch (error: any) {
    return errorResponse(error.message || '调整余额失败')
  }
})
