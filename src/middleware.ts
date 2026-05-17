import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_PREFIX = '/admin'
const API_PREFIX = '/api'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('rawaa_admin_token')
  const { pathname } = request.nextUrl

  if (pathname.startsWith(ADMIN_PREFIX) && !pathname.startsWith('/admin/login') && !token) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith(`${API_PREFIX}/admin`)) {
    if (pathname === `${API_PREFIX}/admin/auth` && request.method === 'POST') {
      const response = NextResponse.next()
      addSecurityHeaders(response)
      return response
    }
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
  }

  const response = NextResponse.next()
  addSecurityHeaders(response)
  return response
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '0')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; media-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
  )
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
