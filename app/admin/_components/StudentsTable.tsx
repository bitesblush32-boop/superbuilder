'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from '@/components/ui/sheet'
import type { StudentRow, StudentDetail } from '@/lib/db/queries/admin'

// ─── Stage / tier helpers ────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  '1': 'var(--text-3)',
  '2': 'var(--blue)',
  '3': 'var(--amber)',
  '4': 'var(--green)',
  '5': 'var(--bdg-super, #FFD700)',
}
const STAGE_LABELS: Record<string, string> = {
  '1': 'Applied', '2': 'Quiz', '3': 'Pre-pay', '4': 'Paid', '5': 'Submitted',
}
const TIER_COLORS: Record<string, string> = {
  premium: 'var(--bdg-super, #FFD700)',
  pro:     'var(--blue)',
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

function formatRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

// ─── Student detail sheet content ────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>{label}</span>
      <span className="text-sm" style={{ color: 'var(--text-1)' }}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function StudentDetailPanel({ studentId }: { studentId: string }) {
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/students/${studentId}`)
      .then(r => r.json())
      .then((d: StudentDetail) => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [studentId])

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 rounded" style={{ background: 'var(--bg-float)' }} />
        ))}
      </div>
    )
  }
  if (!detail?.student) return <p className="p-4 text-sm" style={{ color: 'var(--text-3)' }}>Not found.</p>

  const { student: s, parent: p, quizAttempt: q, ideaSubmission: idea, payment: pay } = detail

  return (
    <div className="p-4 space-y-6 overflow-y-auto">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center font-display text-lg shrink-0"
          style={{ background: 'var(--brand-subtle)', color: 'var(--brand)' }}
        >
          {initials(s.fullName)}
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-1)' }}>{s.fullName}</p>
          <p className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>{s.email}</p>
        </div>
      </div>

      {/* Stage + tier badges */}
      <div className="flex gap-2 flex-wrap">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'var(--bg-float)', color: STAGE_COLORS[s.currentStage] }}
        >
          Stage {s.currentStage} · {STAGE_LABELS[s.currentStage]}
        </span>
        {s.tier && (
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--bg-float)', color: TIER_COLORS[s.tier] }}
          >
            {s.tier === 'premium' ? '⭐ Premium' : 'Pro'}
          </span>
        )}
        {s.isPaid && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--green-bg, rgba(34,197,94,0.1))', color: 'var(--green)' }}>
            ✓ Paid
          </span>
        )}
      </div>

      <Section title="Profile">
        <DetailRow label="Grade"    value={`Grade ${s.grade}`} />
        <DetailRow label="School"   value={s.schoolName} />
        <DetailRow label="City"     value={s.city} />
        <DetailRow label="State"    value={s.state} />
        <DetailRow label="Phone"    value={s.phone} />
        <DetailRow label="Gender"   value={s.gender} />
        <DetailRow label="Coding"   value={s.codingExp} />
        <DetailRow label="Device"   value={s.deviceAccess} />
        <DetailRow label="XP"       value={`${s.xpPoints} pts`} />
        <DetailRow label="Joined"   value={formatDate(s.createdAt)} />
        <DetailRow label="Referral" value={s.referralCode} />
        <DetailRow label="Discord"  value={s.discordId} />
      </Section>

      {p && (
        <Section title="Parent / Guardian">
          <DetailRow label="Name"         value={p.fullName} />
          <DetailRow label="Email"        value={p.email} />
          <DetailRow label="Phone"        value={p.phone} />
          <DetailRow label="Relationship" value={p.relationship} />
          <DetailRow label="Consent"      value={p.consentGiven ? `✓ Given ${formatDate(p.consentAt)}` : '✗ Pending'} />
        </Section>
      )}

      {q && (
        <Section title="Quiz">
          <DetailRow label="Score"   value={`${q.score} / 10`} />
          <DetailRow label="Passed"  value={q.passed ? '✓ Yes' : '✗ No'} />
          <DetailRow label="Attempt" value={`#${q.attemptNum}`} />
          <DetailRow label="Date"    value={formatDate(q.createdAt)} />
        </Section>
      )}

      {idea && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-3)' }}>Idea</h4>
          <div className="space-y-2">
            <DetailRow label="Domain" value={idea.domain} />
            <div className="flex flex-col gap-0.5 col-span-2">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>Problem</span>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>{idea.problemStatement}</p>
            </div>
            <div className="flex flex-col gap-0.5 col-span-2">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-4)' }}>AI Approach</span>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>{idea.aiApproach}</p>
            </div>
          </div>
        </div>
      )}

      {pay && (
        <Section title="Payment">
          <DetailRow label="Amount"     value={formatRupees(pay.amount)} />
          <DetailRow label="Tier"       value={pay.tier} />
          <DetailRow label="Status"     value={pay.status} />
          <DetailRow label="Confirmed"  value={formatDate(pay.confirmedAt)} />
          <DetailRow label="Order ID"   value={pay.razorpayOrderId} />
          <DetailRow label="Payment ID" value={pay.razorpayPaymentId} />
        </Section>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-faint)' }}>
        {(['Advance Stage', 'Award Badge', 'Send Email', 'Flag for Review'] as const).map(action => (
          <button
            key={action}
            disabled
            className="text-xs px-3 py-2 rounded-lg border opacity-40 cursor-not-allowed"
            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-3)' }}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────
interface Props {
  students:    StudentRow[]
  total:       number
  currentPage: number
}

export function StudentsTable({ students, total, currentPage }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const router   = useRouter()
  const params   = useSearchParams()
  const pathname = usePathname()

  const totalPages = Math.ceil(total / 50)

  function goToPage(p: number) {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(p))
    router.push(`${pathname}?${next.toString()}`)
  }

  const offset = (currentPage - 1) * 50

  return (
    <>
      {/* Table */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: 'var(--bg-raised)' }}>
                {['#', 'Student', 'Grade', 'City', 'Stage', 'Tier', 'XP', 'Joined'].map(h => (
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
              {students.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className="cursor-pointer transition-colors duration-100"
                  style={{ borderBottom: '1px solid var(--border-faint)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-raised)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-4)' }}>
                    {offset + i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display shrink-0"
                        style={{ background: 'var(--brand-subtle)', color: 'var(--brand)' }}
                      >
                        {initials(s.fullName)}
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-1)' }}>{s.fullName}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-4)' }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-2)' }}>Gr. {s.grade}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-3)' }}>{s.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ color: STAGE_COLORS[s.currentStage], background: 'var(--bg-float)' }}
                    >
                      {s.currentStage} · {STAGE_LABELS[s.currentStage]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.tier ? (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ color: TIER_COLORS[s.tier], background: 'var(--bg-float)' }}
                      >
                        {s.tier === 'premium' ? '⭐ Premium' : 'Pro'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-4)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-brand)' }}>
                    {s.xpPoints}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-4)' }}>
                    {formatDate(s.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-faint)' }}>
          {students.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className="px-4 py-3 flex items-center gap-3 cursor-pointer"
              style={{ background: 'var(--bg-card)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-display shrink-0"
                style={{ background: 'var(--brand-subtle)', color: 'var(--brand)' }}
              >
                {initials(s.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>{s.fullName}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-4)' }}>{s.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs" style={{ color: STAGE_COLORS[s.currentStage] }}>
                  Stage {s.currentStage}
                </span>
                {s.tier && (
                  <span className="text-xs" style={{ color: TIER_COLORS[s.tier] }}>
                    {s.tier === 'premium' ? '⭐' : 'Pro'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--text-4)' }}>
            No students match your filters.
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
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className="w-8 h-8 text-xs rounded-lg transition-colors"
                  style={{
                    background:  p === currentPage ? 'var(--brand)' : 'transparent',
                    color:       p === currentPage ? 'var(--bg-void)' : 'var(--text-3)',
                    fontWeight:  p === currentPage ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
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

      {/* Student detail sheet */}
      <Sheet open={!!selectedId} onOpenChange={open => { if (!open) setSelectedId(null) }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col"
          style={{
            background:  'var(--bg-card)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <SheetHeader
            className="px-4 py-3 border-b shrink-0"
            style={{ borderColor: 'var(--border-faint)' }}
          >
            <SheetTitle style={{ color: 'var(--text-1)' }}>Student Profile</SheetTitle>
          </SheetHeader>
          {selectedId && <StudentDetailPanel studentId={selectedId} />}
        </SheetContent>
      </Sheet>
    </>
  )
}
