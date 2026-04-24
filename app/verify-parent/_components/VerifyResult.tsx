'use client'

import { useSearchParams } from 'next/navigation'

export function VerifyResult() {
  const params = useSearchParams()
  const status = params.get('status')

  if (status === 'success') {
    return (
      <div className="text-center max-w-sm w-full">
        <div
          className="rounded-2xl border p-8 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            ✓
          </div>
          <h1
            className="font-display text-3xl tracking-wide"
            style={{ color: 'var(--text-1)' }}
          >
            EMAIL VERIFIED
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
            Thank you! Your email address is verified. You&apos;ll now receive
            progress updates for your child throughout the Super Builders programme.
          </p>
          <p
            className="font-mono text-[11px] tracking-[0.1em]"
            style={{ color: 'var(--text-4)' }}
          >
            SUPER BUILDERS · by zer0.pro
          </p>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="text-center max-w-sm w-full">
        <div
          className="rounded-2xl border p-8 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}
          >
            ⏳
          </div>
          <h1
            className="font-display text-3xl tracking-wide"
            style={{ color: 'var(--text-1)' }}
          >
            LINK EXPIRED
          </h1>
          <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
            This verification link has expired or already been used. Check your inbox
            for a newer email, or ask your child to re-submit their application.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center max-w-sm w-full">
      <div
        className="rounded-2xl border p-8 space-y-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
        >
          ✕
        </div>
        <h1
          className="font-display text-3xl tracking-wide"
          style={{ color: 'var(--text-1)' }}
        >
          INVALID LINK
        </h1>
        <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
          This link is invalid. Please use the link from the original email
          sent to your inbox.
        </p>
      </div>
    </div>
  )
}
