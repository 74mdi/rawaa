import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PREFIX = '/admin'
const API_PREFIX = '/api'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('rawaa_admin_token')
  const { pathname } = request.nextUrl

  // Protected admin pages
  if (pathname.startsWith(ADMIN_PREFIX) && !pathname.startsWith('/admin/login') && !token) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Protected API routes (admin-only)
  if (pathname.startsWith(`${API_PREFIX}/admin`)) {
    if (pathname === `${API_PREFIX}/admin/auth` && request.method === 'POST') {
      return NextResponse.next()
    }
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
  }

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
