'use client'

import { useState } from 'react'

const CLARITY_PROJECT_ID = 'wi03jcbx8s'
const CLARITY_BASE = 'https://clarity.microsoft.com/projects/view/' + CLARITY_PROJECT_ID

type Period = 'today' | '7d' | '30d' | '90d'

const PERIODS: { label: string; value: Period; clarityParam: string }[] = [
  { label: 'Today',   value: 'today', clarityParam: '1'  },
  { label: '7 Days',  value: '7d',    clarityParam: '7'  },
  { label: '30 Days', value: '30d',   clarityParam: '30' },
  { label: '90 Days', value: '90d',   clarityParam: '90' },
]

const SECTIONS = [
  {
    label: 'Dashboard',
    desc: 'Sessions, page views, bounce rate, traffic sources',
    icon: '📊',
    path: '/dashboard',
    color: 'var(--blue)',
    bg: 'var(--blue-bg)',
    border: 'rgba(96,165,250,0.2)',
  },
  {
    label: 'Heatmaps',
    desc: 'Where users click, tap, and scroll on every page',
    icon: '🔥',
    path: '/heatmaps',
    color: 'var(--amber)',
    bg: 'var(--amber-bg)',
    border: 'rgba(251,191,36,0.2)',
  },
  {
    label: 'Recordings',
    desc: 'Full session replays of real user journeys',
    icon: '🎥',
    path: '/recordings',
    color: 'var(--purple)',
    bg: 'var(--purple-bg)',
    border: 'rgba(192,132,252,0.2)',
  },
  {
    label: 'Insights',
    desc: 'AI-detected rage clicks, dead clicks, quick backs',
    icon: '🧠',
    path: '/insights',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    label: 'Filters',
    desc: 'Segment by device, browser, OS, country',
    icon: '🔍',
    path: '/filters',
    color: 'var(--text-brand)',
    bg: 'var(--brand-subtle)',
    border: 'var(--border-brand)',
  },
  {
    label: 'Settings',
    desc: 'Manage project, team access, and masking rules',
    icon: '⚙️',
    path: '/settings',
    color: 'var(--text-3)',
    bg: 'var(--bg-float)',
    border: 'var(--border-faint)',
  },
]

const METRICS = [
  { label: 'Total Sessions',    icon: '👤', desc: 'Unique visitor sessions' },
  { label: 'Page Views',        icon: '📄', desc: 'Pages loaded across all sessions' },
  { label: 'Engaged Sessions',  icon: '⚡', desc: 'Sessions with real interaction' },
  { label: 'Avg Scroll Depth',  icon: '↕️', desc: '% of page scrolled on average' },
  { label: 'Dead Clicks',       icon: '💀', desc: 'Clicks with no page response' },
  { label: 'Rage Clicks',       icon: '😤', desc: 'Frustrated rapid repeated clicks' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7d')

  const selected = PERIODS.find(p => p.value === period)!
  const dashboardUrl = `${CLARITY_BASE}/dashboard?date=${selected.clarityParam}`

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-wider" style={{ color: 'var(--text-1)' }}>
            ANALYTICS
          </h1>
          <p className="text-sm mt-0.5 font-mono" style={{ color: 'var(--text-3)' }}>
            Microsoft Clarity · Project{' '}
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

      {/* Tracking status */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono w-fit"
        style={{ background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--green)' }}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--green)' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--green)' }} />
        </span>
        Clarity tracking active — collecting sessions, clicks &amp; heatmap data in real time
      </div>

      {/* Primary launch panel */}
      <div
        className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,184,0,0.07) 0%, rgba(255,184,0,0.02) 100%)',
          border: '1px solid var(--border-brand)',
        }}
      >
        <div className="flex-1 space-y-1">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-brand)' }}>
            Open Clarity Dashboard
          </p>
          <p className="font-display text-2xl tracking-wide" style={{ color: 'var(--text-1)' }}>
            VIEW LAST {selected.label.toUpperCase()}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Sessions, heatmaps, recordings, and AI insights for superbuilder.org
          </p>
        </div>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading font-bold text-sm tracking-wide transition-all duration-150 active:scale-95"
          style={{ background: 'var(--brand)', color: '#000', boxShadow: '0 0 24px rgba(255,184,0,0.2)' }}
        >
          Open in Clarity ↗
        </a>
      </div>

      {/* Section deep-links */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>
          JUMP TO SECTION — last {selected.label.toLowerCase()}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SECTIONS.map(s => (
            <a
              key={s.label}
              href={`${CLARITY_BASE}${s.path}?date=${selected.clarityParam}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl border transition-all duration-150 active:scale-[0.98]"
              style={{ background: s.bg, borderColor: s.border }}
            >
              <span className="text-xl shrink-0 leading-none mt-0.5">{s.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: s.color }}>{s.label}</p>
                <p className="text-[11px] mt-0.5 leading-tight" style={{ color: 'var(--text-3)' }}>{s.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Metrics reference */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-3)' }}>
          WHAT CLARITY TRACKS
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {METRICS.map(m => (
            <div
              key={m.label}
              className="flex flex-col gap-2 p-3 rounded-xl border"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <span className="text-lg leading-none">{m.icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{m.label}</span>
              <span className="text-[10px] leading-tight" style={{ color: 'var(--text-3)' }}>{m.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-faint)' }}
      >
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Project: <span style={{ color: 'var(--text-brand)' }}>{CLARITY_PROJECT_ID}</span>
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Tracking: superbuilder.org + all subpaths
        </p>
        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>
          Retention: 90 days
        </p>
        <a
          href="https://clarity.microsoft.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono ml-auto transition-colors"
          style={{ color: 'var(--text-3)' }}
        >
          clarity.microsoft.com ↗
        </a>
      </div>
    </div>
  )
}
