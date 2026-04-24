import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkStageLock } from '@/lib/auth/stageLock'
import { StageLocked } from '@/components/stage/StageLocked'
import { Stage1Form } from '@/app/register/stage-1/_components/Stage1Form'
import { getParentByStudentId } from '@/lib/db/queries/parents'
import type { Stage1FormData } from '@/lib/validation/stage1'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Apply — Super Builders',
  description: 'Start your Super Builders application. Takes about 5 minutes.',
}

export default async function DashboardApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const { isOpen } = await checkStageLock(1)
  if (!isOpen) return <StageLocked stageNum={1} />

  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Fetch the full student row (we need hackathonDomain to decide access)
  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  // ── Access policy ─────────────────────────────────────────────────────────
  // Allow backward navigation as long as the student hasn't locked Stage 2.
  // "Locked" = they have selected a hackathon domain (domain page commits them).
  // - No student record   → allow (fresh signup)
  // - currentStage === 1  → allow (never completed Stage 1)
  // - currentStage === 2 AND no domain → allow (submitted Stage 1 but hasn't
  //                         started Stage 2 sub-steps yet — safe to edit)
  // - currentStage === 2 AND domain set → redirect (Stage 2 in progress)
  // - currentStage >= 3  → redirect (paid / beyond)
  if (student) {
    const stage = parseInt(student.currentStage, 10)
    if (stage >= 3) redirect('/dashboard')
    if (stage === 2 && student.hackathonDomain) redirect('/dashboard')
  }

  // ── Build initialData for form pre-fill ───────────────────────────────────
  let initialData: Partial<Stage1FormData> | undefined = undefined

  if (student) {
    // Fetch parent record in parallel with nothing else (already have student)
    const parent = await getParentByStudentId(student.id)

    initialData = {
      fullName: student.fullName ?? undefined,
      dateOfBirth: student.dateOfBirth ?? undefined,
      gender: (student.gender as Stage1FormData['gender']) ?? undefined,
      grade: (student.grade as Stage1FormData['grade']) ?? undefined,
      schoolName: student.schoolName ?? undefined,
      city: student.city ?? undefined,
      state: student.state ?? undefined,
      phone: student.phone ?? undefined,
      codingExp: (student.codingExp as Stage1FormData['codingExp']) ?? undefined,
      interests: (student.interests ?? []) as string[],
      availabilityHrs: (student.availabilityHrs as Stage1FormData['availabilityHrs']) ?? undefined,
      deviceAccess: (student.deviceAccess as Stage1FormData['deviceAccess']) ?? undefined,
      tshirtSize: (student.tshirtSize as Stage1FormData['tshirtSize']) ?? undefined,
      instagramHandle: student.instagramHandle ?? undefined,
      linkedinHandle: student.linkedinHandle ?? undefined,
      ...(parent ? {
        parent: {
          parentName: parent.fullName,
          parentEmail: parent.email,
          parentPhone: parent.phone,
          relationship: (parent.relationship as Stage1FormData['parent']['relationship']) ?? 'guardian',
          consentGiven: parent.consentGiven as true,
          safetyAcknowledged: parent.safetyAcknowledged as true,
          emergencyContact: parent.emergencyContact ?? '',
        },
      } : {}),
    }
  }

  const params = await searchParams
  // If they have a student record already, default to step 1 unless ?step=2 asked
  const initialStep = params?.step === '2' ? 2 : 1

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-12">
      <Stage1Form initialStep={initialStep} initialData={initialData} />
    </div>
  )
}
