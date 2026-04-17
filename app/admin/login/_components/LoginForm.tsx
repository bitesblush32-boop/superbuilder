'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm({ adminEmail }: { adminEmail: string }) {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        router.push('/admin')
      } else {
        setError(data.error ?? 'Invalid credentials')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: 'var(--text-3)' }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={adminEmail}
          required
          autoComplete="email"
          inputMode="email"
          className="px-4 min-h-[48px] rounded-lg border bg-transparent text-sm outline-none transition-colors duration-150 focus:border-brand"
          style={{
            background:  'var(--bg-inset)',
            borderColor: 'var(--border-subtle)',
            color:       'var(--text-1)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-xs font-mono tracking-widest uppercase"
          style={{ color: 'var(--text-3)' }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="px-4 min-h-[48px] rounded-lg border bg-transparent text-sm outline-none transition-colors duration-150"
          style={{
            background:  'var(--bg-inset)',
            borderColor: 'var(--border-subtle)',
            color:       'var(--text-1)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--brand)')}
          onBlur={e  => (e.target.style.borderColor = 'var(--border-subtle)')}
        />
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-xs font-mono px-3 py-2 rounded-lg border"
          style={{
            color:       'var(--red)',
            background:  'var(--red-bg)',
            borderColor: 'rgba(248,113,113,0.25)',
          }}
        >
          ✕ {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="min-h-[48px] rounded-lg font-semibold text-sm tracking-wide transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        style={{
          background: loading ? 'var(--brand-dim)' : 'var(--brand)',
          color:      '#000',
        }}
      >
        {loading ? 'Signing in…' : 'Sign In →'}
      </button>
    </form>
  )
}
