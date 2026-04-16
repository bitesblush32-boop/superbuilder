'use client'

// global-error.tsx — required by Next.js App Router.
// This file REPLACES the root layout when a top-level unhandled error occurs,
// so it MUST supply its own <html> and <body> tags.
// It must be a Client Component (error boundaries require client code).

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          fontFamily: 'system-ui, sans-serif',
          color: '#fafafa',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            maxWidth: '480px',
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '12px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#a1a1aa', marginBottom: '32px', lineHeight: 1.6 }}>
            An unexpected error occurred. Our team has been notified.
            {error.digest && (
              <span style={{ display: 'block', marginTop: '8px', fontSize: '0.75rem', color: '#52525b' }}>
                Error reference: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              background: '#FFB800',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 28px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
