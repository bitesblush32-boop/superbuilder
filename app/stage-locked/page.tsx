import { StageLocked } from '@/components/stage/StageLocked'

export const metadata = {
  title: 'Coming Soon — Super Builders',
}

export default async function StageLockedPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>
}) {
  const sp    = await searchParams
  const stage = parseInt(sp.stage ?? '2', 10)
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-void)' }}>
      <StageLocked stageNum={stage} />
    </div>
  )
}
