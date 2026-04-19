'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'

const BOTTOM_TABS = [
  { href: '/dashboard',             label: 'Home',        emoji: '🏠' },
  { href: '/dashboard/workshops',   label: 'Workshops',   emoji: '🎓' },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', emoji: '🏆' },
  { href: '/dashboard/submit',      label: 'Submit',      emoji: '🚀' },
  { href: '/dashboard/team',        label: 'Team',        emoji: '🤝' },
] as const

export function DashboardBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex border-t"
      style={{
        background:           'rgba(10,10,10,0.95)',
        backdropFilter:       'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor:          'var(--border-faint)',
        paddingBottom:        'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Dashboard mobile navigation"
    >
      {BOTTOM_TABS.map(tab => {
        const isActive = pathname === tab.href ||
          (tab.href !== '/dashboard' && pathname.startsWith(tab.href))

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[52px] py-2 transition-all active:scale-90"
            style={{ color: isActive ? 'var(--text-brand)' : 'var(--text-4)' }}
          >
            {/* Active indicator bar at top */}
            {isActive && (
              <span
                className="absolute top-0 inset-x-0 mx-auto w-6 h-0.5 rounded-full"
                style={{ background: 'var(--brand)' }}
              />
            )}
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span
              className="font-mono text-[10px] tracking-wide"
              style={{ fontWeight: isActive ? 700 : 400 }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
