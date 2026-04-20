import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { students, parents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { SuccessClient } from './_components/SuccessClient'

export const metadata = {
  title: "You're In! — Super Builders",
  description: 'Welcome to Super Builders. Your journey starts now.',
}

export default async function SuccessPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.clerkId, userId))
    .limit(1)

  if (!student)         redirect('/dashboard/apply')
  if (!student.isPaid)  redirect('/dashboard/pay')

  const [parent] = await db
    .select({ fullName: parents.fullName, email: parents.email })
    .from(parents)
    .where(eq(parents.studentId, student.id))
    .limit(1)

  const firstName    = student.fullName.split(' ')[0]
  const referralCode = student.referralCode ?? ''
  const xp           = student.xpPoints

  return (
    <SuccessClient
      firstName={firstName}
      fullName={student.fullName}
      referralCode={referralCode}
      xp={xp}
    />
  )
}
