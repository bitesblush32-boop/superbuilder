import { getAllSettings } from '@/lib/db/queries/teams'
import { StagesClient } from './_components/StagesClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Stage Control — Super Builders Admin',
}

const EXPECTED_STAGE_KEYS = [
  'stage_1_open', 'stage_2_open', 'stage_3_open',
  'stage_4_open', 'stage_5_open', 'stage_6_open',
]

export default async function AdminStagesPage() {
  const settings = await getAllSettings()
  const settingMap = new Map(settings.map(s => [s.key, s]))

  // Ensure all 6 stage rows appear in the UI even if not yet seeded in DB
  const stageSettings = EXPECTED_STAGE_KEYS.map(key =>
    settingMap.get(key) ?? { key, value: 'false', label: null, updatedAt: new Date() }
  )

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h2
          className="font-display text-2xl md:text-3xl tracking-wide"
          style={{ color: 'var(--text-1)' }}
        >
          STAGE CONTROL
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Open and close programme stages for all students in real-time
        </p>
      </div>

      {/* Warning banner */}
      <div
        className="rounded-xl px-4 py-3 text-sm font-body border"
        style={{
          background:  'rgba(251,191,36,0.06)',
          borderColor: 'rgba(251,191,36,0.25)',
          color:       'var(--amber)',
        }}
      >
        ⚠️ Changes are instant and affect all students. Closing a stage locks
        students out immediately. Opening a stage lets everyone in at once.
      </div>

      <StagesClient settings={stageSettings} />
    </div>
  )
}
