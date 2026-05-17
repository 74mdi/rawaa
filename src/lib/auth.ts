import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import bcrypt from 'bcryptjs'

const JWT_SECRET_VALUE = process.env.JWT_SECRET
if (!JWT_SECRET_VALUE || JWT_SECRET_VALUE.length < 32) {
  console.error('WARNING: JWT_SECRET is not set or too short. Set a strong secret in production.')
}

const JWT_SECRET = new TextEncoder().encode(
  JWT_SECRET_VALUE || 'fallback-secret-key-change-in-production-min-32-chars'
)

export async function createToken(email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { email: string }
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('rawaa_admin_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
