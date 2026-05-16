import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { getLogs } from '@/lib/admin-log'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await getLogs(50)
  return NextResponse.json(logs)
}
