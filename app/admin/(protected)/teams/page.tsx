import { db } from '@/lib/db'
import { teams } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function formatDate(d: Date | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default async function AdminTeamsPage() {
  const allTeams = await db
    .select({
      id:          teams.id,
      name:        teams.name,
      code:        teams.code,
      memberCount: teams.memberCount,
      isLocked:    teams.isLocked,
      createdAt:   teams.createdAt,
    })
    .from(teams)
    .orderBy(desc(teams.createdAt))

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl">
      <div>
        <h2
          className="font-display text-2xl md:text-3xl tracking-wide"
          style={{ color: 'var(--text-1)' }}
        >
          TEAMS
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          {allTeams.length} team{allTeams.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border-faint)' }}
      >
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: 'var(--bg-raised)' }}>
                {['Team Name', 'Code', 'Members', 'Locked', 'Created'].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs uppercase tracking-wider font-medium whitespace-nowrap"
                    style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--border-faint)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allTeams.map(t => (
                <tr
                  key={t.id}
                  className="transition-colors duration-100"
                  style={{ borderBottom: '1px solid var(--border-faint)' }}
                >
                  <td className="px-4 py-3 font-body font-medium" style={{ color: 'var(--text-1)' }}>
                    {t.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-[12px] px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--brand-subtle)', color: 'var(--text-brand)' }}
                    >
                      {t.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 4 }, (_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: i < t.memberCount
                                ? 'var(--brand)'
                                : 'var(--border-subtle)',
                            }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
                        {t.memberCount} / 4
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {t.isLocked ? (
                      <span
                        className="font-mono text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)' }}
                      >
                        Locked
                      </span>
                    ) : (
                      <span
                        className="font-mono text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--green)' }}
                      >
                        Open
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-4)' }}>
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y" style={{ borderColor: 'var(--border-faint)' }}>
          {allTeams.map(t => (
            <div
              key={t.id}
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: 'var(--bg-card)' }}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{t.name}</p>
                <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-brand)' }}>{t.code}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                <span className="font-mono text-xs" style={{ color: 'var(--text-3)' }}>
                  {t.memberCount} / 4
                </span>
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: t.isLocked ? 'rgba(248,113,113,0.1)' : 'rgba(34,197,94,0.1)',
                    color:      t.isLocked ? 'var(--red)' : 'var(--green)',
                  }}
                >
                  {t.isLocked ? 'Locked' : 'Open'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {allTeams.length === 0 && (
          <p className="py-12 text-center text-sm" style={{ color: 'var(--text-4)' }}>
            No teams created yet.
          </p>
        )}
      </div>
    </div>
  )
}
