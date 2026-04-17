import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdmin = createRouteMatcher(['/admin(.*)'])

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/register/stage-2(.*)',
  '/register/stage-3(.*)',
  '/register/success(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isAdmin(req)) {
    const { userId, sessionClaims } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
    }
    return
  }

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
