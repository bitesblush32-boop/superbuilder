// Dashboard layout — auth-protected, streaming-enabled shell
// Wraps all /dashboard/* routes. Provides DashboardShell + MobileNav.

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
