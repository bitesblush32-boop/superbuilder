import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'

// All dashboard pages are dynamic — auth-gated and personalised.
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Stage gate: must be at stage 4+ (post-payment) to access dashboard
  const { student } = await getStudentOrRedirect(4)

  // Extra guard: paid flag must be true
  if (student && !student.isPaid) {
    redirect('/register/stage-3/pay')
  }

  return (
    <div className="min-h-screen bg-bg-base">
      {/* TODO: DashboardShell — Navbar + MobileNav + sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
