import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { AdminSidebar, AdminMobileTopBar } from './_components/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const adminEmail = user?.emailAddresses[0]?.emailAddress ?? 'admin'

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop sidebar */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Desktop top bar */}
        <header
          className="hidden md:flex items-center justify-between px-6 h-14 border-b shrink-0"
          style={{
            background:  'var(--bg-card)',
            borderColor: 'var(--border-faint)',
          }}
        >
          <h1
            className="text-sm font-semibold tracking-wide"
            style={{ color: 'var(--text-2)' }}
          >
            Super Builders Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
              {adminEmail}
            </span>
            <Link
              href="/"
              className="text-xs px-3 py-1.5 rounded border transition-colors duration-150"
              style={{
                color:       'var(--text-brand)',
                borderColor: 'var(--border-brand)',
              }}
            >
              View Site ↗
            </Link>
          </div>
        </header>

        {/* Mobile top bar */}
        <AdminMobileTopBar adminEmail={adminEmail} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
