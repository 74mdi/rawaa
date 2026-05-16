import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken, verifyToken, comparePassword, hashPassword } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { loginSchema, passwordChangeSchema } from '@/lib/validations'
import { addLog } from '@/lib/admin-log'

export async function POST(request: NextRequest) {
  const data = await request.json()

  if (data.action === 'login') {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(`login:${ip}`, 5, 60000)
    if (!rl.ok) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 1 minute.' }, { status: 429 })
    }

    const parsed = loginSchema.safeParse({ email: data.email, password: data.password })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = parsed.data
    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const valid = await comparePassword(password, admin.password)
    if (!valid) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 })
    }

    const token = await createToken(admin.email)

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date(), lastLoginIp: ip },
    })
    await addLog('Connexion', `Admin connecté: ${email}`, ip)

    const maxAge = data.rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24
    const response = NextResponse.json({
      success: true,
      email: admin.email,
      lastLogin: admin.lastLogin,
    })
    response.cookies.set('rawaa_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    })
    return response
  }

  if (data.action === 'logout') {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const cookieHeader = request.cookies
    const token = cookieHeader.get('rawaa_admin_token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        await addLog('Déconnexion', `Admin déconnecté: ${payload.email}`, ip)
      }
    }
    const response = NextResponse.json({ success: true })
    response.cookies.set('rawaa_admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  }

  if (data.action === 'change-password') {
    const cookieHeader = request.cookies
    const token = cookieHeader.get('rawaa_admin_token')?.value
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Session invalide' }, { status: 401 })

    const parsed = passwordChangeSchema.safeParse({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email: payload.email } })
    if (!admin) return NextResponse.json({ error: 'Admin non trouvé' }, { status: 404 })

    const valid = await comparePassword(parsed.data.currentPassword, admin.password)
    if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })

    const hashed = await hashPassword(parsed.data.newPassword)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashed },
    })
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    await addLog('Mot de passe changé', `Admin ${payload.email} a changé son mot de passe`, ip)

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('rawaa_admin_token')?.value
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const admin = await prisma.admin.findUnique({
    where: { email: payload.email },
    select: { email: true, lastLogin: true, lastLoginIp: true, createdAt: true },
  })
  if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

  return NextResponse.json(admin)
}
