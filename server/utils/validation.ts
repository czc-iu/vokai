import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少8个字符').max(100),
  name: z.string().min(1, '请输入姓名').max(100).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export const contactSchema = z.object({
  name: z.string().min(1, '请输入姓名').max(100),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().min(1, '请输入留言内容').max(2000),
})

export const chatSchema = z.object({
  message: z.string().min(1, '请输入消息').max(4000),
  conversationId: z.number().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type ChatInput = z.infer<typeof chatSchema>

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.errors[0]
      return { success: false, error: firstError?.message || '验证失败' }
    }
    return { success: false, error: '验证失败' }
  }
}
