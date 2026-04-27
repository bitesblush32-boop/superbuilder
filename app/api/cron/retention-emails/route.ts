// ─────────────────────────────────────────────────────────────────────────────
// Retention email cron — runs every 12 hours via Railway cron service
// Sends up to 5 retention emails (spaced 12h apart) to parents of students
// who passed the quiz but have not paid yet.
//
// Security: requires Authorization: Bearer <CRON_SECRET> header
// ─────────────────────────────────────────────────────────────────────────────
import { NextResponse }                        from 'next/server'
import { db }                                  from '@/lib/db'
import { students, parents, quizAttempts, commsLog } from '@/lib/db/schema'
import { eq, and, sql }                        from 'drizzle-orm'
import { sendEmail }                           from '@/lib/email/send'
import { quizPassedParentRetentionTemplate }   from '@/lib/email/templates'

export const dynamic  = 'force-dynamic'
export const runtime  = 'nodejs'

const MAX_ATTEMPTS = 5
const TEMPLATE_PREFIX = 'quiz_passed_parent_retention_'

export async function GET(req: Request) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Find candidates ───────────────────────────────────────────────────────
  // Students who: passed the quiz (quizAttempts.passed = true)
  //               AND have not paid yet (students.isPaid = false)
  //               AND have a parent record with an email
  const candidates = await db
    .selectDistinctOn([students.id], {
      studentId:   students.id,
      studentName: students.fullName,
      city:        students.city,
      domain:      students.hackathonDomain,
      parentId:    parents.id,
      parentName:  parents.fullName,
      parentEmail: parents.email,
      quizScore:   quizAttempts.score,
    })
    .from(students)
    .innerJoin(parents,       eq(parents.studentId, students.id))
    .innerJoin(quizAttempts,  and(
      eq(quizAttempts.studentId, students.id),
      eq(quizAttempts.passed, true),
    ))
    .where(eq(students.isPaid, false))

  if (candidates.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 })
  }

  // ── Count prior sends per student in one batch query ─────────────────────
  const priorSendCounts = await db
    .select({
      studentId: commsLog.studentId,
      count:     sql<number>`cast(count(*) as int)`,
    })
    .from(commsLog)
    .where(
      sql`${commsLog.template} LIKE ${TEMPLATE_PREFIX + '%'}
          AND ${commsLog.studentId} = ANY(
            ${sql`ARRAY[${sql.join(
              candidates.map(c => sql`${c.studentId}::uuid`),
              sql`, `
            )}]`}
          )`
    )
    .groupBy(commsLog.studentId)

  const sendCountMap = new Map<string, number>(
    priorSendCounts.map(r => [r.studentId!, r.count])
  )

  // ── Send emails ───────────────────────────────────────────────────────────
  let sent    = 0
  let skipped = 0

  for (const c of candidates) {
    const priorCount = sendCountMap.get(c.studentId) ?? 0

    if (priorCount >= MAX_ATTEMPTS) {
      skipped++
      continue
    }

    const attempt = (priorCount + 1) as 1 | 2 | 3 | 4 | 5
    const templateKey = `${TEMPLATE_PREFIX}${attempt}`

    const { subject, html } = quizPassedParentRetentionTemplate({
      parentName:  c.parentName,
      studentName: c.studentName,
      score:       c.quizScore,
      domain:      c.domain ?? 'general',
      city:        c.city ?? 'India',
      attempt,
    })

    await sendEmail({
      to:          c.parentEmail,
      subject,
      html,
      studentId:   c.studentId,
      studentName: c.studentName,
      template:    templateKey,
    })

    sent++
  }

  return NextResponse.json({ sent, skipped, total: candidates.length })
}
