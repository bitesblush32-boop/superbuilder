import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'Super Builders — Build AI. Win ₹1 Lakh.'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#000000',
          padding: '72px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial gold glow */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            height: '600px',
            background:
              'radial-gradient(ellipse at top, rgba(255,184,0,0.18) 0%, rgba(255,184,0,0.04) 50%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Grid lines — perspective-ish horizontal stripes */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${8 + i * 8}%`,
              height: '1px',
              background: `rgba(255,184,0,${0.04 - i * 0.006})`,
            }}
          />
        ))}

        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,184,0,0.12)',
              border: '1px solid rgba(255,184,0,0.35)',
              borderRadius: '999px',
              padding: '6px 16px',
              color: '#FFB800',
              fontSize: '13px',
              fontFamily: 'monospace',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            zer0.pro · Season 1 · 2025
          </div>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: '-0.01em',
            color: '#FFFFFF',
            marginBottom: '8px',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
          }}
        >
          SUPER
        </div>
        <div
          style={{
            fontSize: '96px',
            fontWeight: 900,
            lineHeight: 0.88,
            letterSpacing: '-0.01em',
            color: '#FFB800',
            marginBottom: '40px',
            fontFamily: 'sans-serif',
            textTransform: 'uppercase',
          }}
        >
          BUILDERS
        </div>

        {/* Sub-headline */}
        <div
          style={{
            fontSize: '22px',
            color: '#A0A0A0',
            fontFamily: 'sans-serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '48px',
          }}
        >
          School Edition · 100% Online · Jun 7–8, 2025
        </div>

        {/* Stat pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { value: '₹1,00,000+', label: 'Prize Pool' },
            { value: 'Class 8–12', label: 'Eligible' },
            { value: '65 Days',    label: 'Programme' },
          ].map(({ value, label }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '14px 20px',
              }}
            >
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FFB800',
                  fontFamily: 'sans-serif',
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#606060',
                  fontFamily: 'monospace',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            fontSize: '14px',
            color: '#484848',
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          superbuilders.zer0.pro
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
