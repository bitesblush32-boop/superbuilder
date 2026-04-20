import 'dotenv/config'
import { db } from './index'
import { appSettings } from './schema'

export async function seedSettings() {
  await db.insert(appSettings)
    .values([
      { key: 'price_solo', value: '3499', label: 'Solo registration price (₹)' },
      { key: 'price_team', value: '2999', label: 'Team registration price per head (₹)' },
      // Stage gates — admin opens these manually
      { key: 'stage_1_open', value: 'true',  label: 'Stage 1 — Applications Open' },
      { key: 'stage_2_open', value: 'false', label: 'Stage 2 — Orientation Open' },
      { key: 'stage_3_open', value: 'false', label: 'Stage 3 — Domain & Quiz Open' },
      { key: 'stage_4_open', value: 'false', label: 'Stage 4 — Payment Open' },
      { key: 'stage_5_open', value: 'false', label: 'Stage 5 — Build Phase Open' },
      { key: 'stage_6_open', value: 'false', label: 'Stage 6 — Certificates Open' },
    ])
    .onConflictDoNothing()
}

seedSettings()
  .then(() => { console.log('✅ app_settings seeded'); process.exit(0) })
  .catch((err) => { console.error('❌ seed failed', err); process.exit(1) })
