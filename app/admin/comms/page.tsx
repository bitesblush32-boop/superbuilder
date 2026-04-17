import { getDropoffCounts, getCommsLog } from '@/lib/db/queries/admin'
import { CommsClient } from '../_components/CommsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCommsPage() {
  const [counts, log] = await Promise.all([
    getDropoffCounts(),
    getCommsLog(100),
  ])

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl">
      <div>
        <h2 className="font-display text-2xl md:text-3xl tracking-wide" style={{ color: 'var(--text-1)' }}>
          COMMS
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Manual drop-off recovery triggers + bulk announcements
        </p>
      </div>

      <CommsClient counts={counts} log={log} />
    </div>
  )
}
