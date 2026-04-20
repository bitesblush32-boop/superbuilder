import { redirect }             from 'next/navigation'
import Link                       from 'next/link'
import { eq }                     from 'drizzle-orm'
import { db }                     from '@/lib/db'
import { workshopAttendance }     from '@/lib/db/schema'
import { getStudentOrRedirect }   from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock }         from '@/lib/auth/stageLock'
import { getScheduleItems }       from '@/lib/db/queries/config'
import type { ScheduleItem }      from '@/lib/db/queries/config'
import { WORKSHOPS }              from '@/lib/content/programme'
import { BADGES }                 from '@/lib/gamification/badges'
import { LockedSection }          from '@/components/dashboard/LockedSection'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Workshops — Super Builders',
}

const BADGE_MAP: Record<string, keyof typeof BADGES> = {
  WARRIOR:      'WARRIOR',
  DOMAIN_EXPERT:'DOMAIN_EXPERT',
  PROTOTYPE_PRO:'PROTOTYPE_PRO',
}

type StatusType = 'UPCOMING' | 'LIVE NOW' | 'COMPLETED'

function gcalLink(item: ScheduleItem) {
  const start = item.scheduledAt
    ? new Date(item.scheduledAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : ''
  const end = item.scheduledAt && item.durationMins
    ? new Date(new Date(item.scheduledAt).getTime() + item.durationMins * 60_000)
        .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : start
  const p = new URLSearchParams({
    action: 'TEMPLATE', text: item.title,
    dates: `${start}/${end}`,
    details: `${item.description ?? ''}\n\nJoin: ${item.url ?? ''}`,
    location: item.url ?? '',
  })
  return `https://www.google.com/calendar/render?${p}`
}

function StatusPill({ status }: { status: StatusType }) {
  const styles: Record<StatusType, { bg: string; color: string; dot: string }> = {
    'COMPLETED': { bg: 'rgba(34,197,94,0.08)',   color: 'var(--green)',  dot: 'var(--green)'  },
    'LIVE NOW':  { bg: 'rgba(255,184,0,0.08)',   color: 'var(--brand)',  dot: 'var(--brand)'  },
    'UPCOMING':  { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-4)', dot: 'var(--text-4)' },
  }
  const s = styles[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-full border"
      style={{ background: s.bg, color: s.color, borderColor: s.color + '40' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  )
}

interface WorkshopCardProps {
  num:          number
  title:        string
  dateRange:    string
  outcome:      string
  duration:     number
  badgeKey:     keyof typeof BADGES
  status:       StatusType
  meetingItem:  ScheduleItem | null
  videoItem:    ScheduleItem | null
  resourceItems:ScheduleItem[]
  xpAwarded:    boolean
}

function WorkshopCard({
  num, title, dateRange, outcome, duration,
  badgeKey, status, meetingItem, videoItem, resourceItems, xpAwarded,
}: WorkshopCardProps) {
  const badge = BADGES[badgeKey]

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  status === 'COMPLETED' ? 'rgba(34,197,94,0.04)' : 'var(--bg-card)',
        borderColor: status === 'COMPLETED' ? 'rgba(34,197,94,0.18)' : 'var(--border-faint)',
      }}
    >
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
              Workshop {num} · {dateRange}
            </p>
            <h3 className="font-heading font-bold text-base leading-snug" style={{ color: 'var(--text-1)' }}>
              {title}
            </h3>
          </div>
          <StatusPill status={status} />
        </div>

        <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
          🎯 {outcome} · {duration} mins
        </p>
      </div>

      {/* Badge unlock preview */}
      <div
        className="mx-5 mb-4 rounded-xl p-3 flex items-center gap-3 border"
        style={{
          background:  xpAwarded ? `${badge.color}12` : 'var(--bg-float)',
          borderColor: xpAwarded ? `${badge.color}35` : 'var(--border-faint)',
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 border-2"
          style={{
            background:  xpAwarded ? `${badge.color}20` : 'var(--bg-card)',
            borderColor: xpAwarded ? badge.color : 'var(--border-subtle)',
            filter:      xpAwarded ? 'none' : 'grayscale(0.6)',
            opacity:     xpAwarded ? 1 : 0.5,
          }}
        >
          {badge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-[13px]" style={{ color: xpAwarded ? 'var(--text-1)' : 'var(--text-3)' }}>
            {badge.id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} badge
          </p>
          <p className="font-mono text-[11px]" style={{ color: xpAwarded ? badge.color : 'var(--text-4)' }}>
            {xpAwarded ? '✓ Earned' : `+${badge.xp} XP on completion`}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      {(meetingItem || videoItem || resourceItems.length > 0) && (
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          {meetingItem?.url && (
            <a
              href={meetingItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              📅 Join Live Session
            </a>
          )}
          {meetingItem?.scheduledAt && (
            <a
              href={gcalLink(meetingItem)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              + Calendar
            </a>
          )}
          {videoItem?.url && (
            <a
              href={videoItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              ▶ Watch Replay
            </a>
          )}
          {resourceItems.map(r => r.url && (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              🔗 {r.title}
            </a>
          ))}
        </div>
      )}

      {/* No content yet */}
      {!meetingItem && !videoItem && resourceItems.length === 0 && (
        <div className="px-5 pb-5">
          <p className="font-body text-sm" style={{ color: 'var(--text-4)' }}>
            Links and recordings will appear here once published by the admin.
          </p>
        </div>
      )}
    </div>
  )
}

export default async function WorkshopsPage() {
  const { isOpen } = await checkStageLock(5)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/register')

  const [allItems, attendanceRows] = await Promise.all([
    getScheduleItems('dashboard'),
    db.select().from(workshopAttendance).where(eq(workshopAttendance.studentId, student.id)),
  ])

  // Index attendance by workshopNum
  const attByNum: Record<number, typeof attendanceRows[0]> = {}
  for (const a of attendanceRows) attByNum[a.workshopNum] = a

  // Index schedule items by section + type
  const bySection: Record<string, ScheduleItem[]> = {}
  for (const item of allItems) {
    const s = item.targetSection ?? 'general'
    if (!bySection[s]) bySection[s] = []
    bySection[s].push(item)
  }

  const now = new Date()

  function getStatus(wsNum: number, meetingItem: ScheduleItem | null): StatusType {
    const att = attByNum[wsNum]
    if (att?.attended || att?.watchedReplay) return 'COMPLETED'
    if (meetingItem?.scheduledAt) {
      const start = new Date(meetingItem.scheduledAt)
      const end   = new Date(start.getTime() + (meetingItem.durationMins ?? 90) * 60_000)
      if (now >= start && now <= end) return 'LIVE NOW'
    }
    return 'UPCOMING'
  }

  const orientationItems = bySection['orientation'] ?? []
  const hasAnyContent    = allItems.some(i => i.targetSection?.startsWith('workshop_') || i.targetSection === 'orientation')

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Programme
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          WORKSHOPS
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">

        {!hasAnyContent ? (
          <LockedSection
            emoji="🎓"
            title="Workshop Schedule Coming Soon"
            reason="Links and recordings will appear here once the admin publishes them. Check Discord for updates."
          />
        ) : (
          <>
            {WORKSHOPS.map(ws => {
              const section     = `workshop_${ws.id}`
              const items       = bySection[section] ?? []
              const meetingItem = items.find(i => i.type === 'meeting') ?? null
              const videoItem   = items.find(i => i.type === 'video') ?? null
              const resources   = items.filter(i => i.type === 'resource')
              const badgeKey    = BADGE_MAP[ws.badge] ?? 'WARRIOR'
              const att         = attByNum[ws.id]
              const xpAwarded   = att?.xpAwarded ?? false
              const status      = getStatus(ws.id, meetingItem)

              return (
                <WorkshopCard
                  key={ws.id}
                  num={ws.id}
                  title={ws.title}
                  dateRange={ws.dateRange}
                  outcome={ws.outcome}
                  duration={ws.duration}
                  badgeKey={badgeKey}
                  status={status}
                  meetingItem={meetingItem}
                  videoItem={videoItem}
                  resourceItems={resources}
                  xpAwarded={xpAwarded}
                />
              )
            })}

            {/* Parent Orientation */}
            {orientationItems.length > 0 && (
              <div
                className="rounded-2xl border p-5"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-4)' }}>
                  For Parents
                </p>
                <h3 className="font-heading font-bold text-base mb-1" style={{ color: 'var(--text-1)' }}>
                  Parent Orientation · 30 mins
                </h3>
                <p className="font-body text-sm mb-4" style={{ color: 'var(--text-3)' }}>
                  Programme overview, schedule, safety guidelines and Q&A for parents.
                </p>
                <div className="flex flex-wrap gap-2">
                  {orientationItems.map(item => item.url && (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] px-4 inline-flex items-center gap-2 rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
                      style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
                    >
                      {item.type === 'video' ? '▶ Watch Recording' : '📅 Join Session'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
