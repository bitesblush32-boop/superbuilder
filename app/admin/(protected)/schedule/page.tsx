import { getDatesConfig, getPricingConfig, getScheduleItems } from '@/lib/db/queries/config'
import { ScheduleEditor } from './_components/ScheduleEditor'

export const dynamic = 'force-dynamic'

export default async function AdminSchedulePage() {
  const [dates, pricing, items] = await Promise.all([
    getDatesConfig(),
    getPricingConfig(),
    getScheduleItems(),
  ])

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: 'var(--text-1)' }}>
          SCHEDULE & SETTINGS
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Edit dates, content, and pricing — changes reflect everywhere instantly
        </p>
      </div>
      <ScheduleEditor initialDates={dates} initialPricing={pricing} initialItems={items} />
    </div>
  )
}
