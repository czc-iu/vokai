import { query, queryOne } from '../../utils/db'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('此接口仅在开发环境可用')
  }

  try {
    const body = await readBody(event)
    const email = body.email

    if (!email) {
      return errorResponse('请提供邮箱地址')
    }

    const user = await queryOne<{ id: number; email: string; role: string }>(
      'SELECT id, email, role FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return errorResponse('用户不存在')
    }

    await query('UPDATE users SET role = ? WHERE id = ?', ['admin', user.id])

    const existingAdmin = await queryOne<{ id: number }>(
      'SELECT id FROM admins WHERE user_id = ?',
      [user.id]
    )

    if (!existingAdmin) {
      await query(
        'INSERT INTO admins (user_id, role, status, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [user.id, 'admin', 'active']
      )
    } else {
      await query('UPDATE admins SET status = ? WHERE user_id = ?', ['active', user.id])
    }

    return successResponse({
      message: '管理员设置成功',
      user: {
        id: user.id,
        email: user.email,
        role: 'admin'
      }
    })
  } catch (error: any) {
    console.error('Failed to set admin:', error)
    return errorResponse(error.message || '设置管理员失败')
  }
})
