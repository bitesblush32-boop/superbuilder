import { getAllSettings } from '@/lib/db/queries/teams'
import { getPricingConfig } from '@/lib/db/queries/config'
import { SettingsClient, PricingFeatures } from '../../_components/SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPricingPage() {
  const [settings, pricing] = await Promise.all([
    getAllSettings(),
    getPricingConfig(),
  ])

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
          Live configuration — changes apply immediately to new payments and the landing page
        </p>
      </div>

      <div>
        <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)' }}>
          Prices &amp; Discounts
        </p>
        <SettingsClient settings={settings} />
      </div>

      <div>
        <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: 'var(--text-4)' }}>
          Tier Feature Lists
        </p>
        <PricingFeatures pricing={pricing} />
      </div>
    </div>
  )
}
