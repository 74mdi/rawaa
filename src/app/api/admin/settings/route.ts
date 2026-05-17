import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { storeSettingsSchema } from '@/lib/validations'
import { addLog } from '@/lib/admin-log'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'store-settings.json')

const DEFAULT_SETTINGS = {
  name: 'Rawaa روعة',
  tagline: 'Luxury for everyone',
  taglineAr: 'الفخامة للجميع',
  description: 'Parfums et bijoux de qualité à prix abordables au Maroc',
  whatsapp: '+212600000000',
  instagram: '@rawaa.ma',
  freeShippingThreshold: 200,
  shippingFee: 25,
}

export async function GET() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8')
    return NextResponse.json(JSON.parse(data))
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const parsed = storeSettingsSchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true })
  await writeFile(SETTINGS_FILE, JSON.stringify(parsed.data, null, 2))

  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  await addLog('Paramètres modifiés', 'Paramètres de la boutique mis à jour', ip)

  return NextResponse.json({ success: true, settings: parsed.data })
}
