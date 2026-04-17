import { LoginForm } from './_components/LoginForm'

export const metadata = { title: 'Admin Login — Super Builders' }

export default function AdminLoginPage() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@superbuilders.org'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-void)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl border p-8 flex flex-col gap-6"
        style={{
          background:   'var(--bg-card)',
          borderColor:  'var(--border-faint)',
          boxShadow:    '0 0 40px rgba(255,184,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: 'var(--text-4)' }}
          >
            zer0.pro
          </span>
          <h1
            className="font-display text-3xl tracking-widest"
            style={{ color: 'var(--brand)' }}
          >
            ADMIN ACCESS
          </h1>
          <p
            className="text-xs text-center mt-1"
            style={{ color: 'var(--text-4)' }}
          >
            Super Builders · Season 1 · 2025
          </p>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: 'var(--border-faint)' }} />

        <LoginForm adminEmail={adminEmail} />
      </div>

      {/* Bottom label */}
      <p
        className="mt-6 text-xs font-mono"
        style={{ color: 'var(--text-4)' }}
      >
        Restricted access · Authorised personnel only
      </p>
    </div>
  )
}
