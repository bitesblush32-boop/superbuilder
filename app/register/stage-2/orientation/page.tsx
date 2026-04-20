import { redirect } from 'next/navigation'
import { getStudentOrRedirect } from '@/lib/auth/getStudentOrRedirect'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { getDatesConfig } from '@/lib/db/queries/config'
import { OrientationClient } from './_components/OrientationClient'

export const dynamic = 'force-dynamic'

export default async function OrientationPage() {
  const { isOpen } = await checkStageLock(2)
  if (!isOpen) return <StageLocked stageNum={2} />

  const { student } = await getStudentOrRedirect(2)

  if (!student) redirect('/dashboard/apply')
  if (student.orientationComplete) redirect('/register/stage-2/domain')

  const firstName   = student.fullName.split(' ')[0]
  const datesConfig = await getDatesConfig()

  const hackStart = datesConfig.hackathonStartISO.split('T')[0]
  const hackDay   = parseInt(hackStart.split('-')[2], 10)
  const hackEnd   = datesConfig.hackathonEndISO.split('T')[0]
  const hackEndDay = parseInt(hackEnd.split('-')[2], 10)
  const hackDisplay = `Jun ${hackDay}–${hackEndDay} · 24 hours! 🔥`

  const keyDates = [
    { label: 'Orientation',            date: "Today — you're here! 🎉",                                                   active: true  },
    { label: 'Workshop 1 (AI Basics)', date: datesConfig.workshops[0]?.dateRange ?? 'May 26, 6PM IST · 90 mins',          active: false },
    { label: 'Workshop 2 (Domain)',    date: datesConfig.workshops[1]?.dateRange ?? 'Jun 1–3',                             active: false },
    { label: 'Workshop 3 (Build)',     date: datesConfig.workshops[2]?.dateRange ?? 'Jun 3–5',                             active: false },
    { label: 'Hackathon',              date: hackDisplay,                                                                  active: false },
    { label: 'Results + Certificates', date: `${datesConfig.resultsDisplay} 🏆`,                                          active: false },
  ]

  return <OrientationClient studentId={student.id} firstName={firstName} keyDates={keyDates} />
}
