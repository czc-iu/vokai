import jwt, { type SignOptions } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { ERROR_MESSAGES } from './constants'

export interface JwtPayload {
  userId: number
  email: string
  iat?: number
  exp?: number
}

const BCRYPT_SALT_ROUNDS = 12

interface JwtConfig {
  secret: string | undefined
  expiresIn: string
}

function getJwtConfig(): JwtConfig {
  const config = useRuntimeConfig()
  return {
    secret: config.jwtSecret,
    expiresIn: config.jwtExpiresIn || '7d'
  }
}

function requireSecret(secret: string | undefined): string {
  if (!secret) {
    throw createError({
      statusCode: 500,
      message: 'JWT secret not configured'
    })
  }
  return secret
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: JwtPayload): string {
  const { secret, expiresIn } = getJwtConfig()
  return jwt.sign(payload, requireSecret(secret), { expiresIn } as SignOptions)
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const { secret } = getJwtConfig()
    return jwt.verify(token, requireSecret(secret)) as JwtPayload
  } catch {
    return null
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export function generateRefreshToken(): string {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const LENGTH = 64
  let token = ''
  for (let i = 0; i < LENGTH; i++) {
    token += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return token
}

export function requireAuth(event: { context: Record<string, unknown> }): JwtPayload {
  const auth = event.context?.auth as JwtPayload | undefined

  if (!auth) {
    throw createError({
      statusCode: 401,
      message: ERROR_MESSAGES.AUTH_REQUIRED
    })
  }

  return auth
}
