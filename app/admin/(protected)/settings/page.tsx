import { getAllSettings } from '@/lib/db/queries/teams'
import { SettingsClient } from '../../_components/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPricingPage() {
  const settings = await getAllSettings()

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-3xl">
      <div>
        <h2
          className="font-display text-2xl md:text-3xl tracking-wide"
          style={{ color: 'var(--text-1)' }}
        >
          PRICING
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Live configuration — changes apply immediately to new payments
        </p>
      </div>

      <SettingsClient settings={settings} />
    </div>
  )
}
