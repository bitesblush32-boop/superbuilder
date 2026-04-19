import { DashboardSidebar }   from './DashboardSidebar'
import { DashboardBottomNav } from './DashboardBottomNav'

export interface StudentData {
  id:                  string
  fullName:            string
  firstName:           string
  grade:               string
  city:                string
  tier:                'pro' | 'premium'
  xpPoints:            number
  badges:              string[]
  currentStage:        number
  orientationComplete: boolean
  hackathonDomain:     string | null
  teamId:              string | null
}

export type TeamData = {
  name:        string
  code:        string
  memberCount: number
  members: { fullName: string; isPaid: boolean; teamRole: string }[]
} | null

interface DashboardShellProps {
  student:  StudentData
  team:     TeamData
  children: React.ReactNode
}

export function DashboardShell({ student, team, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Desktop sidebar — hidden on mobile */}
      <aside
        className="hidden md:flex flex-col w-[240px] shrink-0 fixed inset-y-0 left-0 z-30 border-r"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
      >
        <DashboardSidebar student={student} team={team} />
      </aside>

      {/* Main content — offset for sidebar on md+ */}
      <div className="flex-1 md:ml-[240px] flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header
          className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b shrink-0"
          style={{
            background:           'rgba(10,10,10,0.92)',
            backdropFilter:       'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor:          'var(--border-faint)',
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="font-display text-lg tracking-wider"
              style={{ color: 'var(--brand)' }}
            >
              SB
            </span>
            <span className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
              Hey, {student.firstName} 👋
            </span>
          </div>

          {/* XP pill */}
          <div
            className="flex items-center gap-1 px-2.5 h-7 rounded-full border font-mono text-[11px]"
            style={{
              background:  'var(--brand-subtle)',
              borderColor: 'var(--border-brand)',
              color:       'var(--text-brand)',
            }}
          >
            ⚡ {student.xpPoints.toLocaleString('en-IN')}
          </div>
        </header>

        {/* Page content — pb-20 on mobile for bottom nav clearance */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <DashboardBottomNav />
    </div>
  )
}
