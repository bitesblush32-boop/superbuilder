'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { Menu, Zap, ChevronRight, LayoutDashboard, LogOut, Shield, ReceiptText } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCountdown } from '@/hooks/useCountdown'
import { cn } from '@/lib/utils'
import { useUser, useClerk } from '@clerk/nextjs'

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
function CountdownPill({
  regDeadlineISO,
  regDeadlineDisplay,
}: {
  regDeadlineISO: string
  regDeadlineDisplay: string
}) {
  const { days, hours, mins, expired } = useCountdown(new Date(regDeadlineISO))

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
        className="font-mono text-[12px] tracking-wider whitespace-nowrap md:hidden"
        style={{ color: 'var(--text-brand)' }}
      >
        {days}d left
      </span>

      {/* md+: full format */}
      <span
        className="font-mono text-[12px] tracking-widest whitespace-nowrap hidden md:inline"
        style={{ color: 'var(--text-brand)' }}
      >
        {regDeadlineDisplay.toUpperCase()} ·{' '}
        {String(days).padStart(2, '0')}D{' '}
        {String(hours).padStart(2, '0')}H{' '}
        {String(mins).padStart(2, '0')}M
      </span>
    </div>
  )
}

/* ─── Nav links data ───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Programme',  href: '#badges' },
  { label: 'Workshops',  href: '#programme' },
  { label: 'Prizes',     href: '#pricing'     },
  { label: 'For Parents', href: '#parents'  },
  { label: 'FAQ',        href: '#faq'       },
] as const

/* ─── User avatar dropdown ─────────────────────────────────────────────────── */
function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const initials = user?.firstName?.[0]?.toUpperCase() ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? '?'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex shrink-0 items-center justify-center w-9 h-9 aspect-square rounded-full overflow-hidden font-heading font-bold text-sm transition-all active:scale-95 select-none"
        style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          minHeight: '36px',
          maxWidth: '36px',
          maxHeight: '36px',
          flexShrink: 0,
          background: open ? 'var(--brand)' : 'rgba(255,184,0,0.15)',
          color:      open ? '#000' : 'var(--text-brand)',
          border:     '1.5px solid rgba(255,184,0,0.4)',
        }}
        aria-label="Account menu"
        aria-expanded={open}
      >
        {user?.imageUrl ? (
          <Image src={user.imageUrl} alt="Avatar" width={36} height={36} className="rounded-full object-cover w-full h-full" />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-xl overflow-hidden shadow-xl z-50"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-faint)' }}>
            <p className="font-body text-xs truncate" style={{ color: 'var(--text-3)' }}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>
          <Link
            href="/privacy-policy"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 h-11 font-body text-sm transition-colors touch-manipulation active:opacity-70"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Shield className="size-4" />
            Privacy Policy
          </Link>
          <Link
            href="/refund-policy"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 h-11 font-body text-sm transition-colors touch-manipulation active:opacity-70"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ReceiptText className="size-4" />
            Refund Policy
          </Link>
          <button
            onClick={() => { setOpen(false); signOut() }}
            className="flex items-center gap-3 px-4 h-11 w-full text-left font-body text-sm transition-colors touch-manipulation active:opacity-70"
            style={{ color: 'var(--text-2)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-subtle)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Navbar ───────────────────────────────────────────────────────────────── */
export function Navbar({
  regDeadlineISO,
  regDeadlineDisplay,
}: {
  regDeadlineISO: string
  regDeadlineDisplay: string
}) {
  const { isSignedIn, isLoaded } = useUser()
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[52px] md:h-[72px] flex items-center border-b transition-all duration-300 ease-out"
      style={{
        borderColor:          scrolled ? 'var(--border-faint)' : 'transparent',
        background:           scrolled ? 'rgba(0,0,0,0.88)'    : 'transparent',
        backdropFilter:       scrolled ? 'blur(20px)'           : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)'           : 'none',
      }}
    >
      <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* ── Left: Logo ── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 sm:gap-3 min-h-[44px] select-none touch-manipulation transition-opacity duration-150 active:opacity-70"
          aria-label="Super Builders — home"
        >
          <Image
            src="/logo.png"
            alt="Super Builders"
            width={140}
            height={40}
            className="h-8 md:h-10 w-auto object-contain"
            priority
          />
          <span
            className="flex items-center font-heading font-extrabold text-[12px] md:text-[14px] tracking-[0.08em] uppercase leading-none whitespace-nowrap"
            style={{ color: 'var(--text-brand)' }}
          >
            x Super Builders
          </span>
        </Link>

        {/* ── Center: Desktop nav links ── */}
        <nav className="hidden lg:flex h-full min-w-0 items-center gap-3 xl:gap-5" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative inline-flex h-11 shrink-0 items-center font-body font-semibold text-[12px] xl:text-[13px] leading-none tracking-[0.08em] uppercase',
                'transition-colors duration-150 touch-manipulation active:opacity-70',
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

        {/* ── Right: Countdown + CTA + Auth + Hamburger ── */}
        <div className="flex shrink-0 items-center gap-2.5">
          <CountdownPill regDeadlineISO={regDeadlineISO} regDeadlineDisplay={regDeadlineDisplay} />

          {/* Auth-aware CTA — desktop/tablet only */}
          {isLoaded && (
            isSignedIn ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/dashboard/apply"
                  className="inline-flex items-center justify-center gap-1.5 h-[34px] px-4 rounded-[3px] font-heading font-bold text-[11px] md:text-[13px] tracking-[0.12em] uppercase transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95"
                  style={{ background: 'var(--brand)', color: '#000', boxShadow: 'var(--shadow-brand-sm)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--brand-bright)'; el.style.boxShadow = 'var(--shadow-brand)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--brand)'; el.style.boxShadow = 'var(--shadow-brand-sm)' }}
                >
                  <LayoutDashboard className="size-3.5 shrink-0" />
                  My Registration
                </Link>
                <UserMenu />
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center h-[34px] px-4 rounded-[3px] font-heading font-bold text-[11px] md:text-[13px] tracking-[0.12em] uppercase transition-all duration-150 touch-manipulation active:opacity-70"
                  style={{ border: '1.5px solid var(--border-soft)', color: 'var(--text-2)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-brand)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-brand)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center gap-1.5 h-[34px] px-4 rounded-[3px] font-heading font-bold text-[11px] md:text-[14px] tracking-[0.12em] uppercase transition-all duration-150 touch-manipulation active:opacity-70 active:scale-95"
                  style={{ background: 'var(--brand)', color: '#000', boxShadow: 'var(--shadow-brand-sm)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--brand-bright)'; el.style.boxShadow = 'var(--shadow-brand)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--brand)'; el.style.boxShadow = 'var(--shadow-brand-sm)' }}
                >
                  <Zap className="size-3 shrink-0" />
                  Register Now
                </Link>
              </div>
            )
          )}

          {/* ── Hamburger — mobile only ── */}
          {/*
            Fix 3: exactly w-11 h-11 (44×44px), icon 20px (size-5),
            active:scale-90 for instant tap feedback
          */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-md transition-all duration-150 touch-manipulation active:scale-90 active:opacity-70"
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
              forceMount
              className="navbar-mobile-sheet flex flex-col p-0 rounded-t-2xl max-h-[75vh] border-t [&>button]:hidden"
              style={{
                background:  'var(--bg-base)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              {/* a11y title — sr-only */}
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Main site navigation links and registration action.
              </SheetDescription>

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
                <Image
                  src="/logo.png"
                  alt="Super Builders"
                  width={120}
                  height={34}
                  className="h-7 w-auto object-contain"
                />
                <span
                  className="font-heading font-extrabold text-[12px] tracking-[0.08em] uppercase leading-none"
                  style={{ color: 'var(--text-brand)' }}
                >
                  x Super Builders
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
                    <span className="font-body font-semibold text-[13px] tracking-wide uppercase">
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
                className="p-4 shrink-0 border-t flex flex-col gap-2"
                style={{ borderColor: 'var(--border-faint)' }}
              >
                {isLoaded && isSignedIn ? (
                  <>
                    <Link
                      href="/dashboard/apply"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full h-[52px] rounded-[3px] active:scale-[0.98] transition-transform duration-100"
                      style={{ background: 'var(--brand)', color: '#000', boxShadow: '0 0 20px rgba(255,184,0,0.25)' }}
                    >
                      <LayoutDashboard className="size-4 shrink-0" />
                      <span className="font-heading font-bold text-[14px] tracking-[0.08em] uppercase">
                        My Registration
                      </span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full h-[52px] rounded-[3px] active:scale-[0.98] transition-transform duration-100"
                      style={{ background: 'var(--brand)', color: '#000', boxShadow: '0 0 20px rgba(255,184,0,0.25)' }}
                    >
                      <Zap className="size-4 shrink-0" />
                      <span className="font-heading font-bold text-[14px] tracking-[0.08em] uppercase">
                        Register Now — Free
                      </span>
                    </Link>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 w-full h-[44px] rounded-[3px] active:scale-[0.98] transition-transform duration-100"
                      style={{ border: '1.5px solid var(--border-soft)', color: 'var(--text-2)' }}
                    >
                      <span className="font-heading font-semibold text-[13px] tracking-[0.08em] uppercase">
                        Sign In
                      </span>
                    </Link>
                  </>
                )}
                <p
                  className="text-center font-mono text-[12px] tracking-wider"
                  style={{ color: 'var(--text-4)' }}
                >
                  DEADLINE: {regDeadlineDisplay.toUpperCase()} · SPOTS FILLING FAST
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
