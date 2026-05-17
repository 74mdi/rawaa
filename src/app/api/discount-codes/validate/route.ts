import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rl = rateLimit(`discount:validate:${ip}`, 20, 60000)
  if (!rl.ok) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

  const { code, subtotal } = await request.json()
  if (!code || !subtotal) {
    return NextResponse.json({ error: 'Code et sous-total requis' }, { status: 400 })
  }

  const discount = await prisma.discountCode.findFirst({
    where: {
      code: code.toUpperCase(),
      active: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  })

  if (!discount) {
    return NextResponse.json({ valid: false, error: 'Code invalide ou expiré' }, { status: 404 })
  }

  if (discount.minOrder && subtotal < discount.minOrder) {
    return NextResponse.json({
      valid: false,
      error: `Minimum ${discount.minOrder} DH de commande`,
    }, { status: 400 })
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return NextResponse.json({ valid: false, error: 'Code utilisé au maximum' }, { status: 400 })
  }

  let discountAmount = 0
  if (discount.type === 'PERCENTAGE') {
    discountAmount = Math.round(subtotal * (discount.value / 100))
  } else {
    discountAmount = Math.min(discount.value, subtotal)
  }

  return NextResponse.json({
    valid: true,
    type: discount.type,
    value: discount.value,
    discount: discountAmount,
    code: discount.code,
  })
}
