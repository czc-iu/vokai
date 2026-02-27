import { requireAuth } from './auth'
import { queryOne, insert } from './db'
import { throwForbidden } from './response'

interface DbAdmin {
  id: number
  user_id: number
  role: 'super_admin' | 'admin' | 'moderator'
  permissions: string[] | null
  status: string
}

interface AdminInfo {
  userId: number
  email: string
  name: string | null
  adminId: number
  role: string
  permissions: string[]
}

export async function requireAdmin(event: any): Promise<AdminInfo> {
  const auth = requireAuth(event)
  
  const admin = await queryOne<DbAdmin>(
    `SELECT id, user_id, role, permissions, status 
     FROM admins 
     WHERE user_id = ? AND status = 'active'`,
    [auth.userId]
  )

  if (!admin) {
    throwForbidden('需要管理员权限')
  }

  let permissions: string[] = []
  if (admin.permissions) {
    try {
      permissions = Array.isArray(admin.permissions) 
        ? admin.permissions 
        : JSON.parse(admin.permissions as any)
    } catch {
      permissions = []
    }
  }

  return {
    userId: auth.userId,
    email: auth.email,
    name: null,
    adminId: admin.id,
    role: admin.role,
    permissions
  }
}

export async function requireSuperAdmin(event: any): Promise<AdminInfo> {
  const admin = await requireAdmin(event)
  
  if (admin.role !== 'super_admin') {
    throwForbidden('需要超级管理员权限')
  }
  
  return admin
}

export async function requirePermission(event: any, permission: string): Promise<AdminInfo> {
  const admin = await requireAdmin(event)
  
  if (admin.role === 'super_admin') {
    return admin
  }
  
  if (!admin.permissions.includes(permission) && !admin.permissions.includes('all')) {
    throwForbidden(`需要 ${permission} 权限`)
  }
  
  return admin
}

export async function hasPermission(admin: AdminInfo, permission: string): Promise<boolean> {
  if (admin.role === 'super_admin') {
    return true
  }
  
  return admin.permissions.includes(permission) || admin.permissions.includes('all')
}

export async function logAdminAction(
  adminId: number,
  action: string,
  details?: any,
  resourceType?: string,
  resourceId?: number
): Promise<void> {
  try {
    const event = useEvent()
    const headers = getHeaders(event)
    
    await insert('admin_logs', {
      admin_id: adminId,
      action,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      details: details ? JSON.stringify(details) : null,
      ip_address: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
      user_agent: headers['user-agent'] || null
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}
