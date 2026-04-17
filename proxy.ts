import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes — Clerk will NOT enforce auth.protect() on these
const isPublicRoute = createRouteMatcher([
  '/',                      // landing page
  '/sign-in(.*)',           // sign-in + sso-callback catch-all
  '/sign-up(.*)',           // sign-up catch-all
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
