import { getDatesConfig, getScheduleItems } from '@/lib/db/queries/config'
import { ScheduleEditor } from './_components/ScheduleEditor'

export const dynamic = 'force-dynamic'

export default async function AdminSchedulePage() {
  const [dates, items] = await Promise.all([
    getDatesConfig(),
    getScheduleItems(),
  ])

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: 'var(--text-1)' }}>
          SCHEDULE
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Edit dates and content — changes reflect everywhere instantly
        </p>
      </div>
      <ScheduleEditor initialDates={dates} initialItems={items} />
    </div>
  )
}
