import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { transformProduct } from '@/lib/utils'
import { productSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { addLog } from '@/lib/admin-log'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const featured = searchParams.get('featured')
  const active = searchParams.get('active')
  const search = searchParams.get('search')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
  const sort = searchParams.get('sort')

  const where: Record<string, unknown> = {}
  if (category) where.category = category
  if (featured === 'true') where.featured = true
  if (active !== 'false') where.active = true
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { nameAr: { contains: search } },
      { tags: { has: search } },
    ]
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }
  if (sort === 'name') orderBy = { name: 'asc' }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    products: products.map(transformProduct),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const rl = rateLimit(`product:create:${session.email}`, 30, 60000)
  if (!rl.ok) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
  }

  const data = await request.json()
  const parsed = productSchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      images: parsed.data.images,
      tags: parsed.data.tags,
      subcategory: parsed.data.subcategory || null,
      originalPrice: parsed.data.originalPrice || null,
    },
  })

  await addLog('Produit créé', `"${product.name}" créé`, ip)
  return NextResponse.json(transformProduct(product), { status: 201 })
}
