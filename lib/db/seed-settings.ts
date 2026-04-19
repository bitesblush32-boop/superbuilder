import 'dotenv/config'
import { db } from './index'
import { appSettings } from './schema'

export async function seedSettings() {
  await db.insert(appSettings)
    .values([
      { key: 'team_discount_3',   value: '10',   label: 'Team of 3 discount (%)' },
      { key: 'team_discount_4',   value: '20',   label: 'Team of 4 discount (%)' },
      { key: 'pro_price_min',     value: '1499', label: 'Pro tier minimum price (₹)' },
      { key: 'pro_price_max',     value: '1999', label: 'Pro tier maximum price (₹)' },
      { key: 'premium_price_min', value: '2499', label: 'Premium tier minimum price (₹)' },
      { key: 'premium_price_max', value: '2999', label: 'Premium tier maximum price (₹)' },
      { key: 'premium_emi_first', value: '999',  label: 'Premium EMI first instalment (₹)' },
      // Stage gates — admin opens these manually
      { key: 'stage_1_open', value: 'true',  label: 'Stage 1 — Applications Open' },
      { key: 'stage_2_open', value: 'false', label: 'Stage 2 — Orientation & Quiz Open' },
      { key: 'stage_3_open', value: 'false', label: 'Stage 3 — Payment Open' },
      { key: 'stage_4_open', value: 'false', label: 'Stage 4 — Build & Dashboard Open' },
      { key: 'stage_5_open', value: 'false', label: 'Stage 5 — Certificates Open' },
    ])
    .onConflictDoNothing()
}

seedSettings()
  .then(() => { console.log('✅ app_settings seeded'); process.exit(0) })
  .catch((err) => { console.error('❌ seed failed', err); process.exit(1) })
