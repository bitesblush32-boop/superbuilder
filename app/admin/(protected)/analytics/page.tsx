'use client'

import { useState } from 'react'

const CLARITY_PROJECT_ID = 'wi03jcbx8s'
const CLARITY_BASE = 'https://clarity.microsoft.com/projects/view/' + CLARITY_PROJECT_ID

type Period = 'today' | '7d' | '30d' | '90d'

const PERIODS: { label: string; value: Period; clarityParam: string; days: number }[] = [
  { label: 'Today',      value: 'today', clarityParam: '1',  days: 1  },
  { label: '7 Days',     value: '7d',    clarityParam: '7',  days: 7  },
  { label: '30 Days',    value: '30d',   clarityParam: '30', days: 30 },
  { label: '90 Days',    value: '90d',   clarityParam: '90', days: 90 },
]

const QUICK_LINKS = [
  {
    label: 'Dashboard',
    desc: 'Traffic, sessions, pages',
    icon: '📊',
    path: '/dashboard',
    color: 'var(--blue)',
    bg: 'var(--blue-bg)',
  },
  {
    label: 'Heatmaps',
    desc: 'Click & scroll heatmaps',
    icon: '🔥',
    path: '/heatmaps',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
  },
  {
    label: 'Recordings',
    desc: 'Session recordings',
    icon: '🎥',
    path: '/recordings',
    color: 'var(--purple)',
    bg: 'var(--purple-bg)',
  },
  {
    label: 'Insights',
    desc: 'AI-generated insights',
    icon: '🧠',
    path: '/insights',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
  },
  {
    label: 'Filters',
    desc: 'Segment by device, OS',
    icon: '🔍',
    path: '/filters',
    color: 'var(--text-brand)',
    bg: 'var(--brand-subtle)',
  },
  {
    label: 'Settings',
    desc: 'Project configuration',
    icon: '⚙️',
    path: '/settings',
    color: 'var(--text-3)',
    bg: 'var(--bg-float)',
  },
]

const METRIC_CARDS = [
  { label: 'Total Sessions',   icon: '👤', desc: 'Unique visitor sessions tracked by Clarity' },
  { label: 'Page Views',       icon: '📄', desc: 'Total pages viewed across all sessions' },
  { label: 'Engaged Sessions', icon: '⚡', desc: 'Sessions with meaningful interaction' },
  { label: 'Scroll Depth',     icon: '↕️', desc: 'Avg % of page scrolled per session' },
  { label: 'Click Rate',       icon: '🖱️', desc: 'Clicks per session ratio' },
  { label: 'Dead Clicks',      icon: '💀', desc: 'Clicks with no response detected' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7d')
  const [iframeError, setIframeError] = useState(false)

  const selectedPeriod = PERIODS.find(p => p.value === period)!
  const dashboardUrl = `${CLARITY_BASE}/dashboard?date=${selectedPeriod.clarityParam}`

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="font-display text-3xl tracking-wider"
            style={{ color: 'var(--text-1)' }}
          >
            ANALYTICS
          </h1>
          <p className="text-sm mt-0.5 font-mono" style={{ color: 'var(--text-3)' }}>
            Powered by Microsoft Clarity · Project{' '}
            <span style={{ color: 'var(--text-brand)' }}>{CLARITY_PROJECT_ID}</span>
          </p>
        </div>

        {/* Period tabs */}
        <div
          className="flex gap-1 p-1 rounded-lg shrink-0"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-faint)' }}
        >
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 active:scale-95"
              style={{
                background: period === p.value ? 'var(--brand)' : 'transparent',
                color:      period === p.value ? '#000' : 'var(--text-3)',
                fontWeight: period === p.value ? '700' : '500',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active tracking badge */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono w-fit"
        style={{ background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--green)' }}
      >
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: 'var(--green)' }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--green)' }} />
        </span>
        Clarity tracking active — collecting sessions, clicks, and heatmap data in real time
      </div>

      {/* Quick links to Clarity sections */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>
          QUICK ACCESS
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(link => (
            <a
              key={link.label}
              href={`${CLARITY_BASE}${link.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1.5 p-3 rounded-xl border transition-all duration-150 active:scale-95 group"
              style={{
                background:   link.bg,
                borderColor:  'var(--border-faint)',
              }}
            >
              <span className="text-xl leading-none">{link.icon}</span>
              <span
                className="text-xs font-semibold"
                style={{ color: link.color }}
              >
                {link.label}
              </span>
              <span className="text-[10px] leading-tight" style={{ color: 'var(--text-3)' }}>
                {link.desc}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Metric reference cards */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>
          METRICS TRACKED BY CLARITY
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRIC_CARDS.map(m => (
            <div
              key={m.label}
              className="flex flex-col gap-2 p-3 rounded-xl border"
              style={{
                background:  'var(--bg-card)',
                borderColor: 'var(--border-faint)',
              }}
            >
              <span className="text-lg leading-none">{m.icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>
                {m.label}
              </span>
              <span className="text-[10px] leading-tight" style={{ color: 'var(--text-3)' }}>
                {m.desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Clarity Dashboard */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card)' }}
      >
        {/* iframe header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--border-faint)' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-brand)' }}>📈</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
              Clarity Dashboard
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ background: 'var(--bg-float)', color: 'var(--text-3)' }}
            >
              {selectedPeriod.label}
            </span>
          </div>
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-150 active:scale-95"
            style={{
              color:       'var(--text-brand)',
              borderColor: 'var(--border-brand)',
              background:  'var(--brand-subtle)',
            }}
          >
            Open in Clarity ↗
          </a>
        </div>

        {/* iframe or fallback */}
        {!iframeError ? (
          <div className="relative" style={{ height: '600px' }}>
            <iframe
              key={period}
              src={dashboardUrl}
              className="w-full h-full border-0"
              title="Microsoft Clarity Analytics Dashboard"
              onError={() => setIframeError(true)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        ) : (
          /* Fallback when iframe is blocked */
          <div
            className="flex flex-col items-center justify-center gap-6 py-20 px-6 text-center"
            style={{ minHeight: '400px' }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'var(--brand-subtle)', border: '1px solid var(--border-brand)' }}
            >
              📊
            </div>
            <div className="space-y-2">
              <p className="font-semibold" style={{ color: 'var(--text-1)' }}>
                Dashboard requires direct access
              </p>
              <p className="text-sm max-w-sm" style={{ color: 'var(--text-3)' }}>
                Microsoft Clarity blocks iframe embedding for security. Open the dashboard directly in a new tab.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95"
                style={{ background: 'var(--brand)', color: '#000' }}
              >
                Open Clarity Dashboard ↗
              </a>
              <a
                href={`${CLARITY_BASE}/recordings`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-95 border"
                style={{ color: 'var(--text-2)', borderColor: 'var(--border-subtle)' }}
              >
                View Recordings ↗
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Date-filtered direct links */}
      <div
        className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: 'var(--border-faint)', background: 'var(--bg-card)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          Open specific views for <span style={{ color: 'var(--text-brand)' }}>{selectedPeriod.label}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Traffic & Sessions',   path: '/dashboard',   icon: '📊', desc: 'Sessions, bounce rate, pages/session' },
            { label: 'Click Heatmaps',        path: '/heatmaps',    icon: '🔥', desc: 'Where users click on every page' },
            { label: 'Session Recordings',    path: '/recordings',  icon: '🎥', desc: 'Full replays of real user visits' },
            { label: 'AI Insights',           path: '/insights',    icon: '🧠', desc: 'Auto-detected rage clicks, dead zones' },
          ].map(item => (
            <a
              key={item.label}
              href={`${CLARITY_BASE}${item.path}?date=${selectedPeriod.clarityParam}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 active:scale-[0.98] group"
              style={{
                background:  'var(--bg-raised)',
                borderColor: 'var(--border-faint)',
              }}
            >
              <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-1)' }}
                >
                  {item.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                  {item.desc}
                </p>
                <p
                  className="text-[10px] font-mono mt-1.5"
                  style={{ color: 'var(--text-brand)' }}
                >
                  Last {selectedPeriod.label.toLowerCase()} ↗
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div
        className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-faint)' }}
      >
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Project ID: <span style={{ color: 'var(--text-brand)' }}>{CLARITY_PROJECT_ID}</span>
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Tracking: superbuilder.org + all subpaths
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Data retention: 90 days
        </p>
        <a
          href="https://clarity.microsoft.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono ml-auto"
          style={{ color: 'var(--text-3)' }}
        >
          clarity.microsoft.com ↗
        </a>
      </div>
    </div>
  )
}
