import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'testimonials.json')

export async function GET() {
  try {
    const data = await readFile(FILE, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const testimonials = await getTestimonials()
  const newTestimonial = {
    id: Date.now().toString(),
    name: data.name,
    text: data.text,
    textAr: data.textAr || '',
    rating: data.rating || 5,
    active: data.active ?? true,
  }
  testimonials.push(newTestimonial)
  await saveTestimonials(testimonials)
  return NextResponse.json(newTestimonial, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const data = await request.json()
  const testimonials = await getTestimonials()
  const index = testimonials.findIndex((t: { id: string }) => t.id === id)
  if (index === -1) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

  testimonials[index] = { ...testimonials[index], ...data }
  await saveTestimonials(testimonials)
  return NextResponse.json(testimonials[index])
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 })

  const testimonials = await getTestimonials()
  const filtered = testimonials.filter((t: { id: string }) => t.id !== id)
  await saveTestimonials(filtered)
  return NextResponse.json({ success: true })
}

async function getTestimonials() {
  try {
    const data = await readFile(FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveTestimonials(data: unknown[]) {
  await mkdir(path.dirname(FILE), { recursive: true })
  await writeFile(FILE, JSON.stringify(data, null, 2))
}
