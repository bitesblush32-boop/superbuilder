import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Admin auth routes — always public (no cookie check, no Clerk)
const isAdminPublic = createRouteMatcher([
  '/admin/login',
  '/api/admin/auth/(.*)',
])

// Admin pages that require the custom admin_session cookie
const isAdminProtected = createRouteMatcher(['/admin(.*)'])

// Student/user routes that require Clerk auth
const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/register/stage-2(.*)',
  '/register/stage-3(.*)',
  '/register/success(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // 1. Admin public routes — let through immediately, no checks
  if (isAdminPublic(req)) {
    return
  }

  // 2. Admin protected routes — cookie-only check, no Clerk involved
  if (isAdminProtected(req)) {
    const cookie = req.headers.get('cookie') ?? ''
    const match  = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/)
    const hasSession = !!(match?.[1] && match[1].length > 0)

    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    return
  }

  // 3. Student-facing protected routes — Clerk auth
  if (isProtected(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
