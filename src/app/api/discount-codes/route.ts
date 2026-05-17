import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { addLog } from '@/lib/admin-log'
import { z } from 'zod'

const discountSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Lettres majuscules, chiffres, tirets uniquement'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minOrder: z.number().min(0).nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
})

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(codes)
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rl = rateLimit(`discount:create:${session.email}`, 10, 60000)
  if (!rl.ok) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

  const data = await request.json()
  const parsed = discountSchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const code = await prisma.discountCode.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      minOrder: parsed.data.minOrder || null,
      maxUses: parsed.data.maxUses || null,
    },
  })

  await addLog('Code promo créé', `${code.code} (${code.type}: ${code.value})`, ip)
  return NextResponse.json(code, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  if (!data.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const parsed = discountSchema.partial().safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const code = await prisma.discountCode.update({
    where: { id: data.id },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  })

  return NextResponse.json(code)
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  await prisma.discountCode.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
