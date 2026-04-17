'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { PaymentRow } from '@/lib/db/queries/admin'

const STATUS_COLORS: Record<string, string> = {
  captured: 'var(--green)',
  pending:  'var(--amber)',
  failed:   'var(--red)',
  refunded: 'var(--purple)',
}
const STATUS_BG: Record<string, string> = {
  captured: 'rgba(34,197,94,0.1)',
  pending:  'rgba(251,191,36,0.1)',
  failed:   'rgba(248,113,113,0.1)',
  refunded: 'rgba(192,132,252,0.1)',
}

function formatRupees(paise: number) { return `₹${(paise / 100).toLocaleString('en-IN')}` }
function formatDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

interface Props {
  payments:    PaymentRow[]
  total:       number
  currentPage: number
}

export function PaymentsTable({ payments, total, currentPage }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const router   = useRouter()
  const params   = useSearchParams()
  const pathname = usePathname()

  const totalPages = Math.ceil(total / 50)

  function goToPage(p: number) {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(p))
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-faint)' }}>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: 'var(--bg-raised)' }}>
                {['Student', 'Tier', 'Amount', 'Status', 'Razorpay ID', 'Date'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium whitespace-nowrap"
                    style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border-faint)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <>
                  <tr
                    key={p.id}
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="cursor-pointer transition-colors duration-100"
                    style={{ borderBottom: '1px solid var(--border-faint)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-raised)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3">
                      <p style={{ color: 'var(--text-1)' }}>{p.studentName}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>{p.studentEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{
                          background: p.tier === 'premium' ? 'rgba(255,215,0,0.1)' : 'rgba(96,165,250,0.1)',
                          color:      p.tier === 'premium' ? '#FFD700' : 'var(--blue)',
                        }}
                      >
                        {p.tier === 'premium' ? '⭐ Premium' : 'Pro'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium" style={{ color: 'var(--text-brand)' }}>
                      {formatRupees(p.amount)}
                      {p.isEmi && <span className="ml-1 text-xs" style={{ color: 'var(--text-4)' }}>EMI</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                        style={{ background: STATUS_BG[p.status], color: STATUS_COLORS[p.status] }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs max-w-[140px] truncate"
                      style={{ color: 'var(--text-3)' }}>
                      {p.razorpayPaymentId ?? p.razorpayOrderId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-4)' }}>
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {expanded === p.id && (
                    <tr key={`${p.id}-expanded`} style={{ background: 'var(--bg-inset)' }}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <p style={{ color: 'var(--text-4)' }}>Order ID</p>
                            <p className="font-mono mt-0.5" style={{ color: 'var(--text-2)' }}>
                              {p.razorpayOrderId ?? '—'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-4)' }}>Payment ID</p>
                            <p className="font-mono mt-0.5" style={{ color: 'var(--text-2)' }}>
                              {p.razorpayPaymentId ?? '—'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-4)' }}>Confirmed At</p>
                            <p className="font-mono mt-0.5" style={{ color: 'var(--text-2)' }}>
                              {p.confirmedAt ? new Date(p.confirmedAt).toLocaleString('en-IN') : '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-faint)' }}>
          {payments.map(p => (
            <div
              key={p.id}
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{p.studentName}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-4)' }}>
                  {formatDate(p.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-brand)' }}>
                  {formatRupees(p.amount)}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{ background: STATUS_BG[p.status], color: STATUS_COLORS[p.status] }}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {payments.length === 0 && (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--text-4)' }}>
            No payments match your filters.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 min-h-[36px] text-sm rounded-lg border transition-opacity disabled:opacity-30"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
          >
            ← Prev
          </button>
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 min-h-[36px] text-sm rounded-lg border transition-opacity disabled:opacity-30"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
