import { getReferralActivity, getTopReferrers } from '@/lib/db/queries/admin'
import { ReferralsClient } from '@/app/admin/_components/ReferralsClient'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Referrals — Admin' }

export default async function AdminReferralsPage() {
  const [activity, topReferrers] = await Promise.all([
    getReferralActivity(200),
    getTopReferrers(),
  ])

  const stats = {
    total:       activity.length,
    paid:        activity.filter(r => r.paid).length,
    vouchersSent: activity.filter(r => r.voucherSent).length,
  }

  return (
    <ReferralsClient
      topReferrers={topReferrers}
      activity={activity}
      stats={stats}
    />
  )
}
