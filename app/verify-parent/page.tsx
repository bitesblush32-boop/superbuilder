import { Suspense }    from 'react'
import { redirect }    from 'next/navigation'
import { VerifyResult } from './_components/VerifyResult'

export const metadata = {
  title: 'Email Verified — Super Builders',
}

export default function VerifyParentPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <Suspense fallback={<div style={{ color: 'var(--text-4)' }}>Verifying…</div>}>
        <VerifyResult />
      </Suspense>
    </div>
  )
}
