import { getAdminKPIs, getRecentActivity } from '@/lib/db/queries/admin'

export const revalidate = 60

function fmt(n: number): string {
  if (n >= 10_000_00) return `₹${(n / 10_000_00).toFixed(1)}L`
  if (n >= 1_000)    return `₹${(n / 1_000).toFixed(1)}K`
  return `₹${n.toLocaleString('en-IN')}`
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000)
  if (secs < 60)    return `${secs}s ago`
  if (secs < 3600)  return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

interface KPICardProps {
  label:     string
  value:     string
  sub?:      string
  accent?:   string
}

function KPICard({ label, value, sub, accent }: KPICardProps) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1 border"
      style={{
        background:  'var(--bg-card)',
        borderColor: 'var(--border-faint)',
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
        {label}
      </p>
      <p
        className="font-display text-3xl leading-none"
        style={{ color: accent ?? 'var(--text-brand)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-4)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

const STAGE_LABELS: Record<string, string> = {
  '1': 'Stage 1 — Applied',
  '2': 'Stage 2 — Quiz/Idea',
  '3': 'Stage 3 — Pre-payment',
  '4': 'Stage 4 — Paid',
  '5': 'Stage 5 — Submitted',
}

export default async function AdminPage() {
  const [kpis, activity] = await Promise.all([
    getAdminKPIs(),
    getRecentActivity(10),
  ])

  const maxStage = Math.max(...kpis.stageFunnel.map(s => s.count), 1)

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h2
          className="font-display text-2xl md:text-3xl tracking-wide"
          style={{ color: 'var(--text-1)' }}
        >
          OVERVIEW
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Live programme metrics · updates every 60s
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          label="Total Students"
          value={kpis.totalStudents.toLocaleString('en-IN')}
          sub="all registrations"
        />
        <KPICard
          label="Paid Students"
          value={kpis.paidStudents.toLocaleString('en-IN')}
          sub={`${kpis.conversionRate}% conversion`}
          accent="var(--green)"
        />
        <KPICard
          label="Premium"
          value={kpis.premiumCount.toLocaleString('en-IN')}
          sub="₹2,499+ tier"
          accent="var(--bdg-super, #FFD700)"
        />
        <KPICard
          label="Pro"
          value={kpis.proCount.toLocaleString('en-IN')}
          sub="₹1,499 tier"
          accent="var(--blue)"
        />
        <KPICard
          label="Revenue"
          value={fmt(kpis.totalRevenueRupees)}
          sub="confirmed payments"
          accent="var(--green)"
        />
        <KPICard
          label="Today"
          value={kpis.todayRegistrations.toLocaleString('en-IN')}
          sub="new registrations"
          accent="var(--purple)"
        />
        <KPICard
          label="Quiz Pass Rate"
          value={`${kpis.quizPassRate}%`}
          sub="of all attempts"
          accent="var(--amber)"
        />
        <KPICard
          label="Conversion"
          value={`${kpis.conversionRate}%`}
          sub="registered → paid"
          accent="var(--brand)"
        />
      </div>

      {/* Stage funnel */}
      <div
        className="rounded-xl p-4 md:p-5 border space-y-3"
        style={{
          background:  'var(--bg-card)',
          borderColor: 'var(--border-faint)',
        }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          Pipeline Funnel
        </h3>
        <div className="space-y-2.5">
          {kpis.stageFunnel.map(({ stage, count }) => {
            const pct = maxStage > 0 ? Math.round((count / maxStage) * 100) : 0
            return (
              <div key={stage} className="flex items-center gap-3">
                <span
                  className="text-xs font-mono w-28 shrink-0"
                  style={{ color: 'var(--text-3)' }}
                >
                  {STAGE_LABELS[stage]}
                </span>
                <div
                  className="flex-1 h-5 rounded-sm overflow-hidden"
                  style={{ background: 'var(--bg-float)' }}
                >
                  <div
                    className="h-full rounded-sm transition-all duration-500"
                    style={{
                      width:      `${pct}%`,
                      background: 'var(--brand)',
                      opacity:    0.3 + (pct / 100) * 0.7,
                    }}
                  />
                </div>
                <span
                  className="text-xs font-mono w-10 text-right shrink-0"
                  style={{ color: 'var(--text-brand)' }}
                >
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background:  'var(--bg-card)',
          borderColor: 'var(--border-faint)',
        }}
      >
        <div
          className="px-4 md:px-5 py-3 border-b"
          style={{ borderColor: 'var(--border-faint)' }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-3)' }}
          >
            Recent Activity
          </h3>
        </div>

        {activity.length === 0 ? (
          <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--text-4)' }}>
            No activity yet.
          </p>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--border-faint)' }}>
            {activity.map((event, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-4 md:px-5 py-3"
              >
                <span className="text-base leading-none">{event.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-1)' }}
                  >
                    {event.studentName}
                  </span>
                  <span className="text-sm mx-1" style={{ color: 'var(--text-3)' }}>
                    {event.action}
                  </span>
                </div>
                <span
                  className="text-xs font-mono shrink-0"
                  style={{ color: 'var(--text-4)' }}
                >
                  {timeAgo(event.time)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
