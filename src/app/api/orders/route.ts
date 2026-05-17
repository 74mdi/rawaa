import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { transformProduct } from '@/lib/utils'
import { orderSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { calcShipping } from '@/lib/shipping'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { customerName: { contains: search } },
      { phone: { contains: search } },
      { orderNumber: { contains: search } },
      { city: { contains: search } },
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  const transformed = orders.map(order => ({
    ...order,
    items: order.items.map(item => ({
      ...item,
      product: transformProduct(item.product),
    })),
  }))

  return NextResponse.json(transformed)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const rl = rateLimit(`order:create:${ip}`, 5, 60000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Trop de commandes. Réessayez dans 1 minute.' }, { status: 429 })
  }

  const data = await request.json()
  const parsed = orderSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return NextResponse.json({ error: firstError.message }, { status: 400 })
  }

  const { customerName, phone, city, address, notes, items } = parsed.data
  const discountCode = data.discountCode as string | undefined

  try {
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const productIds = items.map((i: { productId: string }) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, price: true, name: true },
      })
      const productMap = new Map(products.map(p => [p.id, p]))

      let total = 0
      const orderItemsData = items.map((item: { productId: string; quantity: number }) => {
        const product = productMap.get(item.productId)
        if (!product) throw new Error(`Produit "${item.productId}" introuvable`)
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuffisant pour "${product.name}" (${product.stock} restants)`)
        }
        total += product.price * item.quantity
        return { productId: item.productId, quantity: item.quantity, price: product.price }
      })

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      let discountAmount = 0
      if (discountCode) {
        const code = await tx.discountCode.findFirst({
          where: {
            code: discountCode.toUpperCase(),
            active: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        })
        if (code) {
          if (!code.maxUses || code.usedCount < code.maxUses) {
            if (!code.minOrder || total >= code.minOrder) {
              if (code.type === 'PERCENTAGE') {
                discountAmount = Math.round(total * (code.value / 100))
              } else {
                discountAmount = Math.min(code.value, total)
              }
              await tx.discountCode.update({
                where: { id: code.id },
                data: { usedCount: { increment: 1 } },
              })
            }
          }
        }
      }

      const afterDiscount = Math.max(0, total - discountAmount)
      const shippingFee = calcShipping(afterDiscount)

      return tx.order.create({
        data: {
          customerName,
          phone,
          city,
          address,
          notes: notes || null,
          total: afterDiscount + shippingFee,
          items: { create: orderItemsData },
        },
        include: { items: true },
      })
    })

    return NextResponse.json(order, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la création de la commande'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
