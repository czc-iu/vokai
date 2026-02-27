import { requireAdmin, logAdminAction } from '../../utils/adminAuth'
import { query } from '../../utils/db'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  try {
    // 1. 查找没有余额记录的用户
    const usersWithoutBalance = await query<
      Array<{
        id: number
        email: string
        name: string
        created_at: Date
      }>
    >(
      `SELECT u.id, u.email, u.name, u.created_at
       FROM users u
       LEFT JOIN token_balances tb ON u.id = tb.user_id
       WHERE tb.id IS NULL`
    )

    // 2. 为没有余额记录的用户创建余额记录
    if (usersWithoutBalance.length > 0) {
      await query(
        `INSERT INTO token_balances (user_id, balance, total_purchased, total_consumed, created_at, updated_at)
         SELECT 
             u.id,
             10000,
             10000,
             0,
             NOW(),
             NOW()
         FROM users u
         LEFT JOIN token_balances tb ON u.id = tb.user_id
         WHERE tb.id IS NULL`
      )

      // 3. 为这些用户添加赠送交易记录
      await query(
        `INSERT INTO token_transactions (user_id, type, amount, balance_after, description, reference_type, reference_id, created_at)
         SELECT 
             u.id,
             'gift',
             10000,
             10000,
             '系统赠送',
             'welcome_bonus_legacy',
             u.id,
             NOW()
         FROM users u
         INNER JOIN token_balances tb ON u.id = tb.user_id
         WHERE tb.total_purchased = 10000
         AND tb.balance = 10000
         AND NOT EXISTS (
             SELECT 1 FROM token_transactions tt 
             WHERE tt.user_id = u.id 
             AND tt.type = 'gift' 
             AND tt.description = '系统赠送'
         )`
      )
    }

    // 4. 获取所有用户的余额状态
    const allUsers = await query<
      Array<{
        id: number
        email: string
        name: string
        balance: number
        total_purchased: number
        total_consumed: number
      }>
    >(
      `SELECT 
          u.id,
          u.email,
          u.name,
          COALESCE(tb.balance, 0) as balance,
          COALESCE(tb.total_purchased, 0) as total_purchased,
          COALESCE(tb.total_consumed, 0) as total_consumed
       FROM users u
       LEFT JOIN token_balances tb ON u.id = tb.user_id
       ORDER BY u.id`
    )

    // 记录操作日志
    await logAdminAction(
      admin.adminId,
      'init_user_balances',
      {
        usersWithoutBalance: usersWithoutBalance.length,
        totalUsers: allUsers.length
      }
    )

    return successResponse({
      message: '余额初始化完成',
      usersWithoutBalance: usersWithoutBalance.length,
      totalUsers: allUsers.length,
      users: allUsers
    })
  } catch (error) {
    console.error('Failed to initialize balances:', error)
    throw createError({
      statusCode: 500,
      message: '初始化余额失败'
    })
  }
})
