import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/images') ||
    pathname === '/' ||
    pathname === '/auth/signin' ||
    pathname === '/auth/signout' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/contact')
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!token) {
    const url = new URL('/auth/signin', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Role-based access control
  const userRole = token.role as string

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  // Client routes
  if (pathname.startsWith('/home')) {
    if (userRole !== 'client') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Redirect authenticated users to their appropriate dashboard
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL(userRole === 'admin' ? '/admin' : '/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next|images|favicon.ico|sitemap.xml).*)',
  ],
} 