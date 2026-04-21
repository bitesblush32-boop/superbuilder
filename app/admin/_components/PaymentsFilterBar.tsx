'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface Props {
  total:   number
  showing: number
}

export function PaymentsFilterBar({ total, showing }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()
  const [, startTransition] = useTransition()

  const updateParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    startTransition(() => router.push(`${pathname}?${next.toString()}`))
  }, [params, pathname, router])

  const inputStyle = {
    background:  'var(--bg-float)',
    borderColor: 'var(--border-subtle)',
    color:       'var(--text-1)',
  }
  const inputBase = 'min-h-[40px] px-3 text-base rounded-lg border bg-transparent outline-none'

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-wrap gap-2">
        <select
          value={params.get('status') ?? ''}
          onChange={e => updateParam('status', e.target.value)}
          className={`${inputBase} cursor-pointer`}
          style={inputStyle}
        >
          <option value="">All Statuses</option>
          <option value="captured">Captured</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          value={params.get('tier') ?? ''}
          onChange={e => updateParam('tier', e.target.value)}
          className={`${inputBase} cursor-pointer`}
          style={inputStyle}
        >
          <option value="">All Tiers</option>
          <option value="premium">Premium</option>
          <option value="pro">Pro</option>
        </select>

        <input
          type="date"
          value={params.get('dateFrom') ?? ''}
          onChange={e => updateParam('dateFrom', e.target.value)}
          className={inputBase}
          style={{ ...inputStyle, colorScheme: 'dark' }}
          title="From date"
        />
        <input
          type="date"
          value={params.get('dateTo') ?? ''}
          onChange={e => updateParam('dateTo', e.target.value)}
          className={inputBase}
          style={{ ...inputStyle, colorScheme: 'dark' }}
          title="To date"
        />

        <a
          href={`/api/admin/payments/export?${params.toString()}`}
          download="payments.csv"
          className="flex items-center gap-1.5 px-4 min-h-[40px] text-sm font-medium rounded-lg border whitespace-nowrap"
          style={{ background: 'var(--bg-float)', borderColor: 'var(--border-brand)', color: 'var(--text-brand)' }}
        >
          ↓ Export CSV
        </a>

        <button
          disabled
          className="flex items-center gap-1.5 px-4 min-h-[40px] text-sm font-medium rounded-lg border opacity-30 cursor-not-allowed"
          style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-3)' }}
        >
          Reconcile with Razorpay
        </button>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
        Showing <span style={{ color: 'var(--text-brand)' }}>{showing.toLocaleString('en-IN')}</span> of{' '}
        <span style={{ color: 'var(--text-1)' }}>{total.toLocaleString('en-IN')}</span> payments
      </p>
    </div>
  )
}
