'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition, useRef, useEffect } from 'react'

interface Props {
  total:   number
  showing: number
}

export function StudentsFilterBar({ total, showing }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '1')
      startTransition(() => router.push(`${pathname}?${next.toString()}`))
    },
    [params, pathname, router],
  )

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => updateParam('search', value), 300)
    },
    [updateParam],
  )

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const inputBase = 'min-h-[40px] px-3 text-base rounded-lg border bg-transparent outline-none transition-colors duration-150'
  const inputStyle = {
    background:  'var(--bg-float)',
    borderColor: 'var(--border-subtle)',
    color:       'var(--text-1)',
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + export row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="search"
          placeholder="Search name, email, school…"
          defaultValue={params.get('search') ?? ''}
          onChange={e => handleSearch(e.target.value)}
          inputMode="search"
          autoComplete="off"
          className={`${inputBase} flex-1 min-w-0`}
          style={{ ...inputStyle, fontSize: '16px' }}
        />
        <a
          href={`/api/admin/students/export?${params.toString()}`}
          download="students.csv"
          className="flex items-center justify-center gap-1.5 px-4 min-h-[40px] text-sm font-medium rounded-lg border transition-colors duration-150 whitespace-nowrap"
          style={{
            background:   'var(--bg-float)',
            borderColor:  'var(--border-brand)',
            color:        'var(--text-brand)',
          }}
        >
          ↓ Export CSV
        </a>
      </div>

      {/* Filter pills row */}
      <div className="flex flex-wrap gap-2">
        <select
          value={params.get('stage') ?? ''}
          onChange={e => updateParam('stage', e.target.value)}
          className={`${inputBase} cursor-pointer`}
          style={inputStyle}
        >
          <option value="">All Stages</option>
          <option value="1">S1 · Applying (DB 1)</option>
          <option value="2">S1 · Quiz/Idea (DB 2)</option>
          <option value="3">S1 · Pre-pay (DB 3)</option>
          <option value="4">S2 · Workshops (DB 4)</option>
          <option value="5">S3 · Hackathon (DB 5)</option>
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
          <option value="unpaid">Unpaid</option>
        </select>

        <select
          value={params.get('grade') ?? ''}
          onChange={e => updateParam('grade', e.target.value)}
          className={`${inputBase} cursor-pointer`}
          style={inputStyle}
        >
          <option value="">All Grades</option>
          {['8', '9', '10', '11', '12'].map(g => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="City…"
          defaultValue={params.get('city') ?? ''}
          onChange={e => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => updateParam('city', e.target.value), 300)
          }}
          inputMode="text"
          autoComplete="off"
          className={inputBase}
          style={{ ...inputStyle, width: '110px', fontSize: '16px' }}
        />
      </div>

      {/* Count */}
      <p className="text-xs" style={{ color: 'var(--text-3)' }}>
        Showing <span style={{ color: 'var(--text-brand)' }}>{showing.toLocaleString('en-IN')}</span> of{' '}
        <span style={{ color: 'var(--text-1)' }}>{total.toLocaleString('en-IN')}</span> students
      </p>
    </div>
  )
}
