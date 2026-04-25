'use client'

import { useState } from 'react'

interface Props {
  code:       string
  showLabel?: boolean
}

export function CopyCodeButton({ code, showLabel }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="min-h-[36px] px-3 rounded-xl font-mono text-sm font-semibold transition-all active:scale-95 border"
      style={{
        background:  copied ? 'rgba(34,197,94,0.1)' : 'var(--bg-float)',
        borderColor: copied ? 'rgba(34,197,94,0.3)' : 'var(--border-subtle)',
        color:       copied ? 'var(--green)' : 'var(--brand)',
      }}
    >
      {copied ? '✓ Copied' : showLabel ? `Copy ${code}` : 'Copy'}
    </button>
  )
}
