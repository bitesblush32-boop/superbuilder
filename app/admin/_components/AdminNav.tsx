'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', emoji: '📊' },
  { href: '/admin/stages', label: 'Stage Control', emoji: '🎚️' },
  { href: '/admin/students', label: 'Students', emoji: '👥' },
  { href: '/admin/payments', label: 'Payments', emoji: '💳' },
  { href: '/admin/teams', label: 'Teams', emoji: '🤝' },
  { href: '/admin/projects', label: 'Projects', emoji: '📁' },
  { href: '/admin/judging', label: 'Judging', emoji: '⚖️' },
  { href: '/admin/comms', label: 'Comms', emoji: '📢' },
  { href: '/admin/schedule', label: 'Schedule', emoji: '📅' },
  { href: '/admin/settings', label: 'Pricing', emoji: '💰' },
]

function NavItem({ href, label, emoji, onClick }: {
  href: string
  label: string
  emoji: string
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 min-h-[48px] text-sm font-medium transition-all duration-150 rounded-r-none active:opacity-70"
      style={{
        color: isActive ? 'var(--text-brand)' : 'var(--text-3)',
        background: isActive ? 'var(--brand-subtle)' : 'transparent',
        borderRight: isActive ? '2px solid var(--brand)' : '2px solid transparent',
      }}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span>{label}</span>
    </Link>
  )
}

function SignOutButton({ onSignOut }: { onSignOut?: () => void }) {
  const router = useRouter()

  async function handleSignOut() {
    onSignOut?.()
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 px-4 min-h-[44px] text-sm font-medium w-full transition-all duration-150 active:scale-95"
      style={{ color: 'var(--text-4)' }}
    >
      <span className="text-base leading-none">🚪</span>
      <span>Sign Out</span>
    </button>
  )
}

export function AdminSidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-[220px] shrink-0 min-h-screen border-r"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-faint)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 h-14 border-b shrink-0"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        <span className="font-display text-lg tracking-widest" style={{ color: 'var(--brand)' }}>
          SUPER<span style={{ color: 'var(--text-2)' }}>BUILDERS</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 pt-3 flex-1">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="pb-2 border-t" style={{ borderColor: 'var(--border-faint)' }}>
        <SignOutButton />
        <p className="px-4 pb-1 text-xs" style={{ color: 'var(--text-4)' }}>
          Season 1 · 2026
        </p>
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {([
            { label: 'S1', open: true  },
            { label: 'S2', open: false },
            { label: 'S3', open: false },
            { label: 'S4', open: false },
            { label: 'S5', open: false },
          ] as const).map(({ label, open }) => (
            <span
              key={label}
              className="font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: open ? 'rgba(34,197,94,0.1)' : 'var(--bg-float)',
                color:      open ? 'var(--green)' : 'var(--text-4)',
              }}
            >
              {label}: {open ? '●' : '○'}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function AdminMobileTopBar({ adminEmail }: { adminEmail: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="md:hidden flex items-center justify-between px-4 h-14 border-b shrink-0"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-faint)',
      }}
    >
      <span className="font-display text-base tracking-widest" style={{ color: 'var(--brand)' }}>
        ADMIN
      </span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="flex flex-col gap-[5px] p-2 min-h-[44px] min-w-[44px] items-center justify-center"
            aria-label="Open navigation"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: 'var(--text-2)',
                transform: open ? 'translateY(6.5px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: 'var(--text-2)',
                opacity: open ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: 'var(--text-2)',
                transform: open ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="p-0 rounded-t-2xl border-t flex flex-col"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
            maxHeight: '80vh',
          }}
        >
          <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--border-faint)' }}>
            <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
              {adminEmail}
            </p>
          </div>
          <nav className="flex flex-col gap-0.5 py-3 overflow-y-auto flex-1">
            {NAV_ITEMS.map(item => (
              <NavItem key={item.href} {...item} onClick={() => setOpen(false)} />
            ))}
          </nav>
          <div
            className="border-t shrink-0"
            style={{
              borderColor: 'var(--border-faint)',
              paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            }}
          >
            <SignOutButton onSignOut={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
