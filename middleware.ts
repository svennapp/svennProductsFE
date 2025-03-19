import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

// This function can be marked `async` if using `await` inside
export default withAuth(
  async function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

// Configure which routes are protected and which are public
export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard',
    '/products/:path*',
    '/scripts/:path*',
    '/settings/:path*',
    
    // Exclude Next.js internals, API routes, login page, and root page (which handles redirects)
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}
