import { getScheduleItems } from '@/lib/db/queries/config'
import type { ScheduleItem } from '@/lib/db/queries/config'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  video:    '▶ Video',
  meeting:  '📅 Meeting',
  resource: '🔗 Resource',
}

const TYPE_COLORS: Record<string, string> = {
  video:    'var(--blue)',
  meeting:  'var(--green)',
  resource: 'var(--amber)',
}

const SECTION_LABELS: Record<string, string> = {
  workshop_1:  'Workshop 1 — AI Fundamentals',
  workshop_2:  'Workshop 2 — Domain Deep-Dive',
  workshop_3:  'Workshop 3 — Build Sprint',
  general:     'General',
  orientation: 'Orientation',
}

function gcalLink(item: ScheduleItem) {
  const start = item.scheduledAt
    ? new Date(item.scheduledAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : ''
  const end = item.scheduledAt && item.durationMins
    ? new Date(new Date(item.scheduledAt).getTime() + item.durationMins * 60000)
        .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    : start
  const params = new URLSearchParams({
    action:   'TEMPLATE',
    text:     item.title,
    dates:    `${start}/${end}`,
    details:  `${item.description ?? ''}\n\nJoin: ${item.url ?? ''}`,
    location: item.url ?? '',
  })
  return `https://www.google.com/calendar/render?${params}`
}

function ItemCard({ item }: { item: ScheduleItem }) {
  const color = TYPE_COLORS[item.type] ?? 'var(--text-3)'
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
    >
      <div className="flex items-start gap-3">
        <span
          className="shrink-0 text-xs font-mono px-2 py-0.5 rounded-full border mt-0.5"
          style={{ color, borderColor: color, background: 'transparent' }}
        >
          {TYPE_LABELS[item.type] ?? item.type}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-1)' }}>
            {item.title}
          </p>
          {item.description && (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-3)' }}>
              {item.description}
            </p>
          )}
          {item.scheduledAt && (
            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-4)' }}>
              {new Date(item.scheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              {item.durationMins && ` · ${item.durationMins} mins`}
            </p>
          )}
        </div>
      </div>

      {(item.url || (item.type === 'meeting' && item.scheduledAt)) && (
        <div className="flex gap-2 flex-wrap">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] px-4 inline-flex items-center rounded-lg text-xs font-heading font-semibold tracking-wide transition-all active:scale-95"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              {item.type === 'video' ? 'Watch Now' : item.type === 'meeting' ? 'Join Meeting' : 'Open Resource'}
            </a>
          )}
          {item.type === 'meeting' && item.scheduledAt && (
            <a
              href={gcalLink(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[36px] px-4 inline-flex items-center rounded-lg text-xs font-heading font-semibold tracking-wide border transition-all active:scale-95"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
            >
              Add to Calendar
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default async function WorkshopsPage() {
  const allItems = await getScheduleItems('dashboard')

  const grouped: Record<string, ScheduleItem[]> = {}
  const sectionOrder = ['workshop_1', 'workshop_2', 'workshop_3', 'general', 'orientation']

  for (const item of allItems) {
    const section = item.targetSection ?? 'general'
    if (!grouped[section]) grouped[section] = []
    grouped[section].push(item)
  }

  const sections = sectionOrder.filter(s => grouped[s]?.length)
  const otherSections = Object.keys(grouped).filter(s => !sectionOrder.includes(s))

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: 'var(--text-1)' }}>
          WORKSHOPS & RESOURCES
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Videos, meeting links, and resources for your programme journey
        </p>
      </div>

      {allItems.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <p className="text-2xl mb-2">🚀</p>
          <p className="font-heading font-semibold" style={{ color: 'var(--text-2)' }}>
            Content coming soon
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-4)' }}>
            Workshop videos and meeting links will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {[...sections, ...otherSections].map(section => (
            <div key={section}>
              <h3
                className="text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-brand)' }}
              >
                {SECTION_LABELS[section] ?? section}
              </h3>
              <div className="space-y-3">
                {grouped[section].map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
