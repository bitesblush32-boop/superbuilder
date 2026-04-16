import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/register/stage-2(.*)',
  '/register/stage-3(.*)',
  '/register/success(.*)',
  '/admin(.*)',
])

// Guard: if Clerk keys are placeholders/missing, skip auth entirely.
// Real Clerk publishable keys are 80+ chars. Placeholders like "pk_live_YOUR_KEY" are short.
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
const clerkConfigured =
  (clerkKey.startsWith('pk_live_') || clerkKey.startsWith('pk_test_')) &&
  clerkKey.length > 40

export default clerkConfigured
  ? clerkMiddleware((auth, req) => {
      if (isProtected(req)) auth.protect()
    })
  : () => NextResponse.next()

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
