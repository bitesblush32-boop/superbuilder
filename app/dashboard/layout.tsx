// Dashboard layout — auth-protected, streaming-enabled shell
// Wraps all /dashboard/* routes. Provides DashboardShell + MobileNav.

// All dashboard pages are dynamic — they are auth-gated and personalised.
// Force-dynamic prevents Next.js from attempting static prerendering, which
// would fail because Clerk uses React context (useContext) at render time.
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* TODO: DashboardShell — Navbar + MobileNav + sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
