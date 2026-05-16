import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { transformProduct } from '@/lib/utils'
import { productSchema } from '@/lib/validations'
import { addLog } from '@/lib/admin-log'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id },
        { slug: id },
      ],
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json(transformProduct(product))
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  if (data.name || data.price || data.stock !== undefined) {
    const partialSchema = productSchema.partial()
    const parsed = partialSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
  }

  const updateData: Record<string, unknown> = { ...data }

  const product = await prisma.product.update({
    where: { id },
    data: updateData,
  })

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  await addLog('Produit modifié', `"${product.name}" mis à jour`, ip)

  return NextResponse.json(transformProduct(product))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  await prisma.product.delete({ where: { id } })

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  await addLog('Produit supprimé', `"${product.name}" supprimé`, ip)

  return NextResponse.json({ success: true })
}
