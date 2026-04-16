'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, Zap, ChevronRight } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCountdown } from '@/hooks/useCountdown'
import { HACKATHON_START } from '@/lib/content/programme'
import { cn } from '@/lib/utils'

/* ─── zer0.pro geometric "0" mark ─────────────────────────────────────────── */
function Zer0Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="11.5" stroke="#FFB800" strokeWidth="1.5" />
      <ellipse cx="13" cy="13" rx="4.5" ry="7" stroke="#FFB800" strokeWidth="1.5" />
      <line
        x1="9.5" y1="18.5"
        x2="16.5" y2="7.5"
        stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  )
}

/* ─── Live countdown pill ──────────────────────────────────────────────────── */
// Mobile (<md): "22d left" — fits in 375px alongside logo + hamburger
// Desktop (md+): "JUN 7 · 22D 14H 37M" — full format
function CountdownPill() {
  const { days, hours, mins, expired } = useCountdown(HACKATHON_START)

  if (expired) return null

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 h-[26px] rounded-full border"
      style={{
        borderColor: 'var(--border-brand)',
        background:  'var(--brand-subtle)',
      }}
    >
      {/* pulsing live dot */}
      <span
        className="size-[5px] rounded-full animate-pulse shrink-0"
        style={{ background: 'var(--brand)' }}
      />

      {/* mobile: days only */}
      <span
        className="font-mono text-[10px] tracking-wider whitespace-nowrap md:hidden"
        style={{ color: 'var(--text-brand)' }}
      >
        {days}d left
      </span>

      {/* md+: full format */}
      <span
        className="font-mono text-[10px] tracking-widest whitespace-nowrap hidden md:inline"
        style={{ color: 'var(--text-brand)' }}
      >
        JUN 7 ·{' '}
        {String(days).padStart(2, '0')}D{' '}
        {String(hours).padStart(2, '0')}H{' '}
        {String(mins).padStart(2, '0')}M
      </span>
    </div>
  )
}

/* ─── Nav links data ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Programme',  href: '#programme' },
  { label: 'Workshops',  href: '#workshops' },
  { label: 'Prizes',     href: '#prizes'    },
  { label: 'For Parents', href: '#parents'  },
  { label: 'FAQ',        href: '#faq'       },
] as const

/* ─── Navbar ───────────────────────────────────────────────────────────────── */
export function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center border-b transition-all duration-300 ease-out"
      style={{
        borderColor:          scrolled ? 'var(--border-faint)' : 'transparent',
        background:           scrolled ? 'rgba(0,0,0,0.88)'    : 'transparent',
        backdropFilter:       scrolled ? 'blur(20px)'           : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)'           : 'none',
      }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* ── Left: Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2 min-h-[44px] select-none"
          aria-label="Super Builders — home"
        >
          <Zer0Mark size={26} />
          <span
            className="font-heading font-extrabold text-[13px] tracking-[0.1em] uppercase leading-none"
            style={{ color: 'var(--text-brand)' }}
          >
            SUPER BUILDERS
          </span>
        </Link>

        {/* ── Center: Desktop nav links ── */}
        <nav className="hidden md:flex items-center gap-5" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative font-heading font-semibold text-[11px] tracking-[0.08em] uppercase',
                'transition-colors duration-150',
                'after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0',
                'after:bg-[var(--brand)] after:transition-all after:duration-200',
                'hover:after:w-full',
              )}
              style={{ color: 'var(--text-3)' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--text-brand)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Right: Countdown + CTA + Hamburger ── */}
        <div className="flex items-center gap-2.5">
          <CountdownPill />

          {/* Register Now — desktop/tablet only */}
          <Link
            href="/register/stage-1"
            className={cn(
              'hidden sm:inline-flex items-center justify-center gap-1.5',
              'h-[34px] px-4 rounded-[3px]',
              'font-heading font-bold text-[11px] tracking-[0.12em] uppercase',
              'transition-all duration-150',
            )}
            style={{
              background: 'var(--brand)',
              color:       '#000',
              boxShadow:   'var(--shadow-brand-sm)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'var(--brand-bright)'
              el.style.boxShadow  = 'var(--shadow-brand)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'var(--brand)'
              el.style.boxShadow  = 'var(--shadow-brand-sm)'
            }}
          >
            <Zap className="size-3 shrink-0" />
            Register Now
          </Link>

          {/* ── Hamburger — mobile only ── */}
          {/*
            Fix 3: exactly w-11 h-11 (44×44px), icon 20px (size-5),
            active:scale-90 for instant tap feedback
          */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-md transition-all duration-150 active:scale-90"
                style={{ color: 'var(--text-2)' }}
                aria-label="Open navigation menu"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'var(--text-brand)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'var(--text-2)')
                }
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>

            {/*
              Fix 1: side="bottom" — slides up from bottom of screen.
              rounded-t-2xl top corners, max-h-[75vh], drag handle pill.
              [&>button]:hidden suppresses the default Radix close (×) button —
              sheet is dismissed by overlay tap, link clicks, or the CTA.
            */}
            <SheetContent
              side="bottom"
              className="flex flex-col p-0 rounded-t-2xl max-h-[75vh] border-t [&>button]:hidden"
              style={{
                background:  'var(--bg-base)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* a11y title — sr-only */}
              <SheetTitle className="sr-only">Navigation</SheetTitle>

              {/* ── Drag handle pill ── */}
              <div className="flex justify-center pt-3 pb-2 shrink-0" aria-hidden="true">
                <div
                  className="w-9 h-1 rounded-full"
                  style={{ background: 'var(--text-4)' }}
                />
              </div>

              {/* ── Sheet logo header ── */}
              <div
                className="flex items-center gap-2 px-5 h-[48px] border-b shrink-0"
                style={{ borderColor: 'var(--border-faint)' }}
              >
                <Zer0Mark size={22} />
                <span
                  className="font-heading font-extrabold text-[12px] tracking-[0.1em] uppercase"
                  style={{ color: 'var(--text-brand)' }}
                >
                  SUPER BUILDERS
                </span>
              </div>

              {/* ── Nav links — min-h-[52px] per link ── */}
              <nav
                className="flex flex-col px-2 py-2 overflow-y-auto flex-1"
                aria-label="Mobile navigation"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between min-h-[52px] px-4 rounded-lg transition-colors duration-100"
                    style={{ color: 'var(--text-2)' }}
                    onTouchStart={(e) => {
                      // immediate visual feedback on tap — no 300ms delay
                      const el = e.currentTarget as HTMLElement
                      el.style.color      = 'var(--text-brand)'
                      el.style.background = 'var(--brand-subtle)'
                    }}
                    onTouchEnd={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.color      = 'var(--text-2)'
                      el.style.background = 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.color      = 'var(--text-brand)'
                      el.style.background = 'var(--brand-subtle)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.color      = 'var(--text-2)'
                      el.style.background = 'transparent'
                    }}
                  >
                    <span className="font-heading font-semibold text-[14px] tracking-wide">
                      {link.label}
                    </span>
                    <ChevronRight
                      className="size-4 opacity-30"
                      style={{ color: 'var(--text-3)' }}
                    />
                  </Link>
                ))}
              </nav>

              {/* ── CTA ── */}
              <div
                className="p-4 shrink-0 border-t"
                style={{ borderColor: 'var(--border-faint)' }}
              >
                <Link
                  href="/register/stage-1"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-[52px] rounded-[3px] active:scale-[0.98] transition-transform duration-100"
                  style={{
                    background: 'var(--brand)',
                    color:       '#000',
                    boxShadow:   '0 0 20px rgba(255,184,0,0.25)',
                  }}
                >
                  <Zap className="size-4 shrink-0" />
                  <span className="font-heading font-bold text-[14px] tracking-[0.08em] uppercase">
                    Register Now — Free
                  </span>
                </Link>
                <p
                  className="mt-2.5 text-center font-mono text-[10px] tracking-wider"
                  style={{ color: 'var(--text-4)' }}
                >
                  DEADLINE: MAY 25 · SPOTS FILLING FAST
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
