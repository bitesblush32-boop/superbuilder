import { Suspense } from 'react'
import { getPayments, getPaymentSummary } from '@/lib/db/queries/admin'
import { PaymentsTable } from '../_components/PaymentsTable'
import { PaymentsFilterBar } from '../_components/PaymentsFilterBar'

interface PageProps {
  searchParams: Promise<{
    status?:   string
    tier?:     string
    dateFrom?: string
    dateTo?:   string
    page?:     string
  }>
}

export const revalidate = 30

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
    >
      <p className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--text-3)' }}>{label}</p>
      <p className="font-display text-2xl mt-1" style={{ color: color ?? 'var(--text-brand)' }}>{value}</p>
    </div>
  )
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))

  const [summary, { payments, total }] = await Promise.all([
    getPaymentSummary(),
    getPayments({
      status:   sp.status,
      tier:     sp.tier,
      dateFrom: sp.dateFrom,
      dateTo:   sp.dateTo,
      page,
      limit:    50,
    }),
  ])

  function fmt(n: number) {
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`
    if (n >= 1_000)   return `₹${(n / 1_000).toFixed(1)}K`
    return `₹${n.toLocaleString('en-IN')}`
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div>
        <h2 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: 'var(--text-1)' }}>
          PAYMENTS
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          All transactions · refreshes every 30s
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Collected"    value={fmt(summary.capturedRupees)} color="var(--green)" />
        <SummaryCard label="Pending"            value={fmt(summary.pendingRupees)}  color="var(--amber)" />
        <SummaryCard label="Failed Count"       value={String(summary.failedCount)} color="var(--red)" />
        <SummaryCard label="Refunded Count"     value={String(summary.refundedCount)} color="var(--purple)" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <Suspense>
          <PaymentsFilterBar total={total} showing={payments.length} />
        </Suspense>
      </div>

      {/* Table */}
      <Suspense>
        <PaymentsTable payments={payments} total={total} currentPage={page} />
      </Suspense>
    </div>
  )
}
