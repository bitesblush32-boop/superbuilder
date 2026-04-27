'use client'

import Link from 'next/link'
import Image from 'next/image'

/* ─── Discord SVG icon (not in Lucide) ────────────────────────────────────── */
function DiscordIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.053a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

/* ─── WhatsApp SVG icon ────────────────────────────────────────────────────── */
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

/* ─── Instagram SVG icon ───────────────────────────────────────────────────── */
function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

/* ─── Link column data ─────────────────────────────────────────────────────── */
const COLUMNS = [
  {
    heading: 'Programme',
    links: [
      { label: 'Timeline', href: '#programme' },
      { label: 'Workshops', href: '#workshops' },
      { label: 'Prizes', href: '#prizes' },
      { label: 'Domains', href: '#domains' },
    ],
  },
  {
    heading: 'Register',
    links: [
      { label: 'Apply Now', href: '/dashboard/apply' },
      { label: 'Tiers & Pricing', href: '#tiers' },
      { label: 'FAQ', href: '#faq' },
      { label: 'For Parents', href: '#parents' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { label: 'Discord Server', href: '#discord' },
      { label: 'WhatsApp Group', href: 'https://chat.whatsapp.com/Kn9WvBrBsXsJ4PWg1rJC56' },
      { label: 'Instagram', href: 'https://www.instagram.com/superbuilder2k26?utm_source=qr&igsh=bXV2ajRubXFhNmV5' },
      { label: 'Mentors', href: '#mentors' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Leaderboard', href: '/dashboard/leaderboard' },
      { label: 'Certificate', href: '/dashboard/certificate' },
      { label: 'Verify Cert', href: '/verify' },
    ],
  },
] as const

/* ─── Social links ─────────────────────────────────────────────────────────── */
const SOCIALS = [
  { label: 'Discord', href: '#discord', Icon: DiscordIcon },
  { label: 'WhatsApp', href: 'https://chat.whatsapp.com/Kn9WvBrBsXsJ4PWg1rJC56', Icon: WhatsAppIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/superbuilder2k26?utm_source=qr&igsh=bXV2ajRubXFhNmV5', Icon: InstagramIcon },
] as const

/* ─── Footer ───────────────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-brand)',
      }}
    >
      {/* Ambient glow — very subtle brand warmth behind footer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.5) 40%, rgba(255,184,0,0.5) 60%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 h-32 w-96 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,184,0,0.4) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      {/* ── Main content ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">

        {/* Top row: brand + socials */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-10">

          {/* Brand block */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Link
              href="/"
              className="flex items-center gap-2 w-fit"
              aria-label="Super Builders — home"
            >
              <Image
                src="/logo.png"
                alt="zer0.pro logo"
                width={100}
                height={28}
                className="h-6 w-auto object-contain"
              />
              <span
                className="font-heading font-extrabold text-[12px] tracking-[0.12em] uppercase"
                style={{ color: 'var(--text-3)' }}
              >
                x Super Builders
              </span>
            </Link>
            <p
              className="font-mono text-[12px] leading-relaxed tracking-wide uppercase"
              style={{ color: 'var(--text-4)' }}
            >
              School Edition · Season 01 · 2026
              <br />
              An online AI hackathon by{' '}
              <a
                href="https://zer0.pro"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-150"
                style={{ color: 'var(--text-3)' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'var(--text-brand)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')
                }
              >
                zer0.pro
              </a>
            </p>

            {/* Prize + date pills */}
            <div className="flex flex-wrap gap-2 mt-1">
              <span
                className="inline-flex items-center h-[20px] px-2 rounded-sm font-mono text-[9px] tracking-widest uppercase border"
                style={{
                  background: 'var(--brand-subtle)',
                  borderColor: 'var(--border-brand)',
                  color: 'var(--text-brand)',
                }}
              >
                ₹1,00,000+ PRIZES
              </span>
              <span
                className="inline-flex items-center h-[20px] px-2 rounded-sm font-mono text-[9px] tracking-widest uppercase border"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-4)',
                }}
              >
                JUN 7–8, 2026
              </span>
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-1">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex items-center justify-center size-[36px] rounded-md border transition-all duration-150"
                style={{
                  borderColor: 'var(--border-faint)',
                  color: 'var(--text-4)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-brand)'
                  el.style.color = 'var(--text-brand)'
                  el.style.background = 'var(--brand-subtle)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--border-faint)'
                  el.style.color = 'var(--text-4)'
                  el.style.background = 'transparent'
                }}
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 pb-8 border-b"
          style={{ borderColor: 'var(--border-faint)' }}
        >
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <p
                className="font-mono text-[9px] tracking-[0.15em] uppercase font-bold"
                style={{ color: 'var(--text-brand)' }}
              >
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-mono text-[12px] tracking-wide transition-colors duration-150 hover:underline underline-offset-2"
                      style={{ color: 'var(--text-4)' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = 'var(--text-2)')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.color = 'var(--text-4)')
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between gap-3 pt-5 flex-wrap">
          <p
            className="font-mono text-[9px] tracking-widest uppercase"
            style={{ color: 'var(--text-4)' }}
          >
            © 2026 zer0.pro · All rights reserved
          </p>

          <div className="flex items-center gap-4">
            {([
              { label: 'Privacy Policy', href: '/terms#privacy' },
              { label: 'Terms of Use',   href: '/terms#terms'   },
              { label: 'Refund Policy',  href: '/terms#refund'  },
            ] as const).map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="font-mono text-[9px] tracking-wider uppercase transition-colors duration-150"
                style={{ color: 'var(--text-4)' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = 'var(--text-4)')
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
