import { redirect }            from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock }       from '@/lib/auth/stageLock'
import { LockedSection }        from '@/components/dashboard/LockedSection'
import { BADGES }               from '@/lib/gamification/badges'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Certificate — Super Builders',
}

const CERTS_LIVE = new Date('2026-06-10T00:00:00+05:30')

// LinkedIn deep-link for adding a certification
function linkedInCertUrl(studentId: string, name: string) {
  const p = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name:      'Super Builders — School Edition',
    organizationId: '0',        // replace with zer0.pro LinkedIn org ID when available
    issueYear:  '2026',
    issueMonth: '6',
    certUrl:    `https://superbuilder.org/verify/${studentId}`,
    certId:     studentId.slice(0, 12).toUpperCase(),
  })
  return `https://www.linkedin.com/profile/add?${p}`
}

export default async function CertificatePage() {
  const { isOpen } = await checkStageLock(6)
  if (!isOpen) redirect('/dashboard')

  const { student } = await getStudentOrRedirect(4)
  if (!student) redirect('/register')

  const now        = new Date()
  const isBefore   = now < CERTS_LIVE
  const superBadge = BADGES.SUPER_BUILDER

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Page header */}
      <div className="px-4 pt-5 pb-2 md:px-6 md:pt-6">
        <p className="font-mono text-[11px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
          Recognition
        </p>
        <h1 className="font-display text-[2rem] md:text-[2.5rem] leading-none tracking-wide" style={{ color: 'var(--text-1)' }}>
          CERTIFICATE
        </h1>
      </div>

      <div className="px-4 md:px-6 space-y-4">

        {isBefore ? (
          <>
            {/* Locked */}
            <LockedSection
              emoji="🏆"
              title="Certificate Unlocks Jun 10"
              reason="Certificates are issued after judging completes. Submit your project on Jun 7–8 to qualify."
              unlocksAt="Jun 10, 2026"
            />

            {/* Badge teaser */}
            <div
              className="rounded-2xl border p-5 flex items-center gap-4"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 border-2"
                style={{
                  background:  `${superBadge.color}15`,
                  borderColor: `${superBadge.color}40`,
                  filter:      'grayscale(0.5)',
                  opacity:     0.6,
                }}
              >
                {superBadge.emoji}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-2)' }}>
                  Super Builder badge unlocks with your certificate
                </p>
                <p className="font-mono text-[11px]" style={{ color: 'var(--text-4)' }}>
                  +{superBadge.xp} XP · {superBadge.copy}
                </p>
              </div>
            </div>

            {/* Certificate preview (blurred) */}
            <div
              className="rounded-2xl border overflow-hidden relative"
              style={{ borderColor: 'var(--border-faint)' }}
            >
              <div
                className="aspect-video flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0A0A0A 0%, #161616 100%)',
                  border:     '4px solid rgba(255,184,0,0.15)',
                }}
              >
                {/* Faux certificate layout */}
                <div className="text-center px-8" style={{ filter: 'blur(6px)', opacity: 0.4 }}>
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: 'var(--text-brand)' }}>
                    zer0.pro certifies that
                  </p>
                  <p className="font-display text-3xl tracking-wide mb-2" style={{ color: 'var(--text-1)' }}>
                    {student.fullName.toUpperCase()}
                  </p>
                  <p className="font-heading text-base mb-1" style={{ color: 'var(--text-2)' }}>
                    has completed Super Builders — School Edition
                  </p>
                  <p className="font-mono text-sm" style={{ color: 'var(--brand)' }}>
                    Season 1 · June 2026
                  </p>
                </div>
                {/* Lock overlay */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                >
                  <div
                    className="rounded-2xl px-6 py-4 flex items-center gap-3 border"
                    style={{ background: 'var(--bg-raised)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="text-2xl">🔒</span>
                    <span className="font-heading font-semibold text-sm" style={{ color: 'var(--text-2)' }}>
                      Unlocks Jun 10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : !student.certificateUrl ? (
          /* State B — generating */
          <div
            className="rounded-2xl border p-8 flex flex-col items-center gap-4 text-center"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
          >
            <div
              className="w-14 h-14 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(255,184,0,0.3)', borderTopColor: 'var(--brand)' }}
            />
            <div>
              <p className="font-display text-xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                GENERATING YOUR CERTIFICATE
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                This can take a few hours. Check back soon — you'll receive a notification via email once it's ready.
              </p>
            </div>
            <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
              Last checked: {now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        ) : (
          /* State C — ready */
          <>
            <div
              className="rounded-2xl border p-5 flex items-center gap-3"
              style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}
            >
              <span style={{ color: 'var(--green)', fontSize: '1.5rem' }}>🎉</span>
              <div>
                <p className="font-heading font-bold text-sm" style={{ color: 'var(--green)' }}>
                  Your certificate is ready!
                </p>
                <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
                  Download it or add it directly to your LinkedIn profile.
                </p>
              </div>
            </div>

            {/* Certificate image */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'rgba(255,184,0,0.2)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={student.certificateUrl}
                alt={`${student.fullName} — Super Builders certificate`}
                className="w-full"
                loading="lazy"
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={student.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-5 rounded-xl font-heading font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: 'var(--brand)', color: '#000' }}
              >
                ⬇ Download Certificate
              </a>
              <a
                href={linkedInCertUrl(student.id, student.fullName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] px-5 rounded-xl font-heading font-semibold text-sm flex items-center justify-center gap-2 border transition-all active:scale-95"
                style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
              >
                🔗 Add to LinkedIn
              </a>
            </div>

            {/* Super Builder badge */}
            <div
              className="rounded-2xl border p-5 flex items-center gap-4"
              style={{ background: `${superBadge.color}08`, borderColor: `${superBadge.color}25` }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 border-2"
                style={{ background: `${superBadge.color}20`, borderColor: superBadge.color }}
              >
                {superBadge.emoji}
              </div>
              <div>
                <p className="font-heading font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                  Super Builder badge earned
                </p>
                <p className="font-mono text-[11px]" style={{ color: superBadge.color }}>
                  +{superBadge.xp} XP · {superBadge.copy}
                </p>
              </div>
            </div>

            {/* Verify URL */}
            <p className="text-center font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
              Certificate ID: {student.id.slice(0, 12).toUpperCase()} ·{' '}
              Verify at superbuilder.org/verify/{student.id.slice(0, 12).toLowerCase()}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
