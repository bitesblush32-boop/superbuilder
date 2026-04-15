import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/register/stage-2(.*)',
  '/register/stage-3(.*)',
  '/register/success(.*)',
  '/admin(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth.protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
