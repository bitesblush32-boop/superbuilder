import { redirect } from 'next/navigation'
import { verifyAdminSession } from '@/lib/auth/adminAuth'
import { AdminSidebar, AdminMobileTopBar } from '../_components/AdminNav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const valid = await verifyAdminSession()
  if (!valid) redirect('/admin/login')

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin'

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
              className="flex justify-center items-center text-xs px-3 rounded border transition-colors duration-150"
              style={{
                color:       'var(--text-brand)',
                borderColor: 'var(--border-brand)',
              }}
            >
              View Site ↗
            </Link>
            <form action="/api/admin/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs px-3 py-1.5 rounded border transition-colors duration-150 active:scale-95"
                style={{
                  color:       'var(--text-3)',
                  borderColor: 'var(--border-faint)',
                }}
              >
                Sign Out
              </button>
            </form>
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
