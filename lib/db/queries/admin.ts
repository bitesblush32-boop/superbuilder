import { db } from '@/lib/db'
import {
  students, payments, quizAttempts, parents, ideaSubmissions, projects, scores, commsLog, teams,
} from '@/lib/db/schema'
import {
  eq, count, sum, gte, lte, desc, asc, isNotNull, isNull, and, or, ilike, notInArray, sql, inArray,
  getTableColumns,
} from 'drizzle-orm'
import crypto from 'crypto'

// ─── util: deterministic UUID from Clerk user ID ──────────────────────────────
export function clerkIdToUuid(clerkId: string): string {
  const hash = crypto.createHash('md5').update(clerkId).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

// ─── Overview KPIs ────────────────────────────────────────────────────────────
export interface AdminKPIs {
  totalStudents:      number
  paidStudents:       number
  premiumCount:       number
  proCount:           number
  totalRevenueRupees: number
  todayRegistrations: number
  quizPassRate:       number
  conversionRate:     number
  stageFunnel:        { stage: string; count: number }[]
}

export async function getAdminKPIs(): Promise<AdminKPIs> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    totalResult,
    paidResult,
    tierResult,
    revenueResult,
    todayResult,
    quizResult,
    stageResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(students),
    db.select({ count: count() }).from(students).where(eq(students.isPaid, true)),
    db
      .select({ tier: students.tier, count: count() })
      .from(students)
      .where(isNotNull(students.tier))
      .groupBy(students.tier),
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, 'captured')),
    db
      .select({ count: count() })
      .from(students)
      .where(gte(students.createdAt, todayStart)),
    db
      .select({ passed: quizAttempts.passed, count: count() })
      .from(quizAttempts)
      .groupBy(quizAttempts.passed),
    db
      .select({ stage: students.currentStage, count: count() })
      .from(students)
      .groupBy(students.currentStage),
  ])

  const totalStudents      = totalResult[0]?.count ?? 0
  const paidStudents       = paidResult[0]?.count ?? 0
  const premiumCount       = tierResult.find(r => r.tier === 'premium')?.count ?? 0
  const proCount           = tierResult.find(r => r.tier === 'pro')?.count ?? 0
  const totalRevenuePaise  = Number(revenueResult[0]?.total ?? 0)
  const todayRegistrations = todayResult[0]?.count ?? 0

  const quizPassCount  = quizResult.find(r => r.passed === true)?.count ?? 0
  const quizTotalCount = quizResult.reduce((acc, r) => acc + r.count, 0)
  const quizPassRate   = quizTotalCount > 0 ? Math.round((quizPassCount / quizTotalCount) * 100) : 0
  const conversionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0

  const stageFunnel = (['1', '2', '3', '4', '5'] as const).map(stage => ({
    stage,
    count: stageResult.find(r => r.stage === stage)?.count ?? 0,
  }))

  return {
    totalStudents, paidStudents, premiumCount, proCount,
    totalRevenueRupees: Math.floor(totalRevenuePaise / 100),
    todayRegistrations, quizPassRate, conversionRate, stageFunnel,
  }
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
export interface ActivityEvent {
  studentName: string
  action:      string
  emoji:       string
  time:        Date
}

export async function getRecentActivity(limit: number): Promise<ActivityEvent[]> {
  const [registrations, quizPasses, confirmedPayments] = await Promise.all([
    db
      .select({ studentName: students.fullName, time: students.createdAt })
      .from(students)
      .orderBy(desc(students.createdAt))
      .limit(limit),
    db
      .select({ studentName: students.fullName, time: quizAttempts.createdAt })
      .from(quizAttempts)
      .innerJoin(students, eq(quizAttempts.studentId, students.id))
      .where(eq(quizAttempts.passed, true))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(limit),
    db
      .select({ studentName: students.fullName, time: payments.confirmedAt })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .where(and(eq(payments.status, 'captured'), isNotNull(payments.confirmedAt)))
      .orderBy(desc(payments.confirmedAt))
      .limit(limit),
  ])

  const events: ActivityEvent[] = [
    ...registrations.map(r => ({ studentName: r.studentName, action: 'registered', emoji: '🧭', time: r.time })),
    ...quizPasses.filter(r => r.time !== null).map(r => ({ studentName: r.studentName, action: 'passed the quiz', emoji: '🧠', time: r.time as Date })),
    ...confirmedPayments
      .filter(r => r.time !== null)
      .map(r => ({ studentName: r.studentName, action: 'payment confirmed', emoji: '⚡', time: r.time as Date })),
  ]

  return events.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, limit)
}

// ─── Students list ────────────────────────────────────────────────────────────
export interface StudentFilters {
  search?: string
  stage?:  string
  tier?:   string   // 'pro' | 'premium' | 'unpaid'
  city?:   string
  grade?:  string
  page?:   number
  limit?:  number
}

export type StudentRow = typeof students.$inferSelect & {
  teamCode: string | null
  teamName: string | null
}

export async function getStudents(
  filters: StudentFilters = {},
): Promise<{ students: StudentRow[]; total: number }> {
  const { search, stage, tier, city, grade, page = 1, limit = 50 } = filters
  const conditions = []

  if (search) {
    conditions.push(
      or(
        ilike(students.fullName, `%${search}%`),
        ilike(students.email, `%${search}%`),
        ilike(students.schoolName, `%${search}%`),
      ),
    )
  }
  if (stage)         conditions.push(eq(students.currentStage, stage as '1' | '2' | '3' | '4' | '5'))
  if (tier === 'unpaid') conditions.push(eq(students.isPaid, false))
  else if (tier)     conditions.push(eq(students.tier, tier as 'pro' | 'premium'))
  if (city)          conditions.push(ilike(students.city, `%${city}%`))
  if (grade)         conditions.push(eq(students.grade, grade as '8' | '9' | '10' | '11' | '12'))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, countResult] = await Promise.all([
    db
      .select({
        ...getTableColumns(students),
        teamCode: teams.code,
        teamName: teams.name,
      })
      .from(students)
      .leftJoin(teams, eq(students.teamId, teams.id))
      .where(where)
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: count() }).from(students).where(where),
  ])

  return { students: rows as StudentRow[], total: countResult[0]?.count ?? 0 }
}

// ─── Student detail ───────────────────────────────────────────────────────────
export interface StudentDetail {
  student:        StudentRow | null
  parent:         typeof parents.$inferSelect | null
  quizAttempt:    typeof quizAttempts.$inferSelect | null
  ideaSubmission: typeof ideaSubmissions.$inferSelect | null
  payment:        typeof payments.$inferSelect | null
  team:           { name: string; code: string; memberCount: number } | null
}

export async function getStudentDetail(studentId: string): Promise<StudentDetail> {
  const [
    studentRows,
    parentRows,
    quizRows,
    ideaRows,
    paymentRows,
  ] = await Promise.all([
    db
      .select({ ...getTableColumns(students), teamCode: teams.code, teamName: teams.name })
      .from(students)
      .leftJoin(teams, eq(students.teamId, teams.id))
      .where(eq(students.id, studentId))
      .limit(1),
    db.select().from(parents).where(eq(parents.studentId, studentId)).limit(1),
    db.select().from(quizAttempts).where(eq(quizAttempts.studentId, studentId))
      .orderBy(desc(quizAttempts.createdAt)).limit(1),
    db.select().from(ideaSubmissions).where(eq(ideaSubmissions.studentId, studentId))
      .orderBy(desc(ideaSubmissions.createdAt)).limit(1),
    db.select().from(payments).where(and(
      eq(payments.studentId, studentId),
      eq(payments.status, 'captured'),
    )).orderBy(desc(payments.createdAt)).limit(1),
  ])

  const studentRecord = (studentRows[0] ?? null) as StudentRow | null

  // Fetch team member count separately if student is in a team
  let team: StudentDetail['team'] = null
  if (studentRecord?.teamId) {
    const teamRows = await db
      .select({ name: teams.name, code: teams.code, memberCount: teams.memberCount })
      .from(teams)
      .where(eq(teams.id, studentRecord.teamId))
      .limit(1)
    team = teamRows[0] ?? null
  }

  return {
    student:        studentRecord,
    parent:         parentRows[0]     ?? null,
    quizAttempt:    quizRows[0]       ?? null,
    ideaSubmission: ideaRows[0]       ?? null,
    payment:        paymentRows[0]    ?? null,
    team,
  }
}

// ─── CSV export ───────────────────────────────────────────────────────────────
export async function exportStudentsCSV(filters: Omit<StudentFilters, 'page' | 'limit'>): Promise<string> {
  const { students: rows } = await getStudents({ ...filters, page: 1, limit: 10_000 })

  const headers = ['Name', 'Email', 'Phone', 'Grade', 'School', 'City', 'State', 'Stage', 'Tier', 'Paid', 'XP', 'Referral Code', 'Joined']
  const csvRows = rows.map(s => [
    s.fullName, s.email, s.phone ?? '', s.grade, s.schoolName ?? '',
    s.city ?? '', s.state ?? '', s.currentStage, s.tier ?? '',
    s.isPaid ? 'Yes' : 'No', s.xpPoints, s.referralCode ?? '',
    s.createdAt.toISOString(),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  return [headers.join(','), ...csvRows].join('\n')
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export interface PaymentFilters {
  status?:   string
  tier?:     string
  dateFrom?: string
  dateTo?:   string
  page?:     number
  limit?:    number
}

export interface PaymentRow {
  id:                string
  studentId:         string
  studentName:       string
  studentEmail:      string
  razorpayOrderId:   string | null
  razorpayPaymentId: string | null
  amount:            number
  tier:              'pro' | 'premium'
  status:            'pending' | 'captured' | 'failed' | 'refunded'
  isEmi:             boolean | null
  discountPct:       number
  confirmedAt:       Date | null
  createdAt:         Date | null
}

export interface PaymentSummary {
  capturedRupees: number
  pendingRupees:  number
  failedCount:    number
  refundedCount:  number
}

export async function getPaymentSummary(): Promise<PaymentSummary> {
  const [captured, pending, failed, refunded] = await Promise.all([
    db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'captured')),
    db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending')),
    db.select({ count: count() }).from(payments).where(eq(payments.status, 'failed')),
    db.select({ count: count() }).from(payments).where(eq(payments.status, 'refunded')),
  ])
  return {
    capturedRupees: Math.floor(Number(captured[0]?.total ?? 0) / 100),
    pendingRupees:  Math.floor(Number(pending[0]?.total ?? 0) / 100),
    failedCount:    failed[0]?.count ?? 0,
    refundedCount:  refunded[0]?.count ?? 0,
  }
}

export async function getPayments(
  filters: PaymentFilters = {},
): Promise<{ payments: PaymentRow[]; total: number }> {
  const { status, tier, dateFrom, dateTo, page = 1, limit = 50 } = filters
  const conditions = []

  if (status)   conditions.push(eq(payments.status, status as 'pending' | 'captured' | 'failed' | 'refunded'))
  if (tier)     conditions.push(eq(payments.tier, tier as 'pro' | 'premium'))
  if (dateFrom) conditions.push(gte(payments.createdAt, new Date(dateFrom)))
  if (dateTo)   conditions.push(lte(payments.createdAt, new Date(dateTo)))

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id:                payments.id,
        studentId:         payments.studentId,
        studentName:       students.fullName,
        studentEmail:      students.email,
        razorpayOrderId:   payments.razorpayOrderId,
        razorpayPaymentId: payments.razorpayPaymentId,
        amount:            payments.amount,
        tier:              payments.tier,
        status:            payments.status,
        isEmi:             payments.isEmi,
        discountPct:       payments.discountPct,
        confirmedAt:       payments.confirmedAt,
        createdAt:         payments.createdAt,
      })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .where(where)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ count: count() })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .where(where),
  ])

  return { payments: rows as PaymentRow[], total: countResult[0]?.count ?? 0 }
}

// ─── Judging ──────────────────────────────────────────────────────────────────
export interface ProjectCard {
  id:               string
  title:            string
  domain:           string
  problemStatement: string
  solutionDesc:     string
  demoVideoUrl:     string | null
  githubUrl:        string | null
  screenshotUrls:   string[] | null
  studentId:        string
  studentName:      string
  grade:            string
  city:             string | null
  submittedAt:      Date | null
}

export interface ScoredProject extends ProjectCard {
  myScore: {
    innovation:   number | null
    impact:       number | null
    technical:    number | null
    presentation: number | null
    completeness: number | null
    totalScore:   number | null
    feedback:     string | null
  }
}

export interface LeaderboardEntry {
  projectId:    string
  projectTitle: string
  studentName:  string
  domain:       string
  avgScore:     number
  judgeCount:   number
}

export async function getProjectsQueue(judgeUuid: string): Promise<ProjectCard[]> {
  const scoredRows = await db
    .select({ projectId: scores.projectId })
    .from(scores)
    .where(eq(scores.judgeId, judgeUuid))

  const scoredIds = scoredRows.map(r => r.projectId)

  const rows = await db
    .select({
      id:               projects.id,
      title:            projects.title,
      domain:           projects.domain,
      problemStatement: projects.problemStatement,
      solutionDesc:     projects.solutionDesc,
      demoVideoUrl:     projects.demoVideoUrl,
      githubUrl:        projects.githubUrl,
      screenshotUrls:   projects.screenshotUrls,
      studentId:        students.id,
      studentName:      students.fullName,
      grade:            students.grade,
      city:             students.city,
      submittedAt:      projects.submittedAt,
    })
    .from(projects)
    .innerJoin(students, eq(projects.studentId, students.id))
    .where(
      and(
        isNotNull(projects.submittedAt),
        scoredIds.length > 0 ? notInArray(projects.id, scoredIds) : undefined,
      ),
    )
    .orderBy(asc(projects.submittedAt))

  return rows as ProjectCard[]
}

export async function getScoredProjects(judgeUuid: string): Promise<ScoredProject[]> {
  const rows = await db
    .select({
      id:               projects.id,
      title:            projects.title,
      domain:           projects.domain,
      problemStatement: projects.problemStatement,
      solutionDesc:     projects.solutionDesc,
      demoVideoUrl:     projects.demoVideoUrl,
      githubUrl:        projects.githubUrl,
      screenshotUrls:   projects.screenshotUrls,
      studentId:        students.id,
      studentName:      students.fullName,
      grade:            students.grade,
      city:             students.city,
      submittedAt:      projects.submittedAt,
      innovation:       scores.innovation,
      impact:           scores.impact,
      technical:        scores.technical,
      presentation:     scores.presentation,
      completeness:     scores.completeness,
      totalScore:       scores.totalScore,
      feedback:         scores.feedback,
    })
    .from(scores)
    .innerJoin(projects, eq(scores.projectId, projects.id))
    .innerJoin(students, eq(projects.studentId, students.id))
    .where(eq(scores.judgeId, judgeUuid))
    .orderBy(desc(scores.createdAt))

  return rows.map(r => ({
    id: r.id, title: r.title, domain: r.domain,
    problemStatement: r.problemStatement, solutionDesc: r.solutionDesc,
    demoVideoUrl: r.demoVideoUrl, githubUrl: r.githubUrl,
    screenshotUrls: r.screenshotUrls,
    studentId: r.studentId, studentName: r.studentName,
    grade: r.grade, city: r.city, submittedAt: r.submittedAt,
    myScore: {
      innovation: r.innovation, impact: r.impact, technical: r.technical,
      presentation: r.presentation, completeness: r.completeness,
      totalScore: r.totalScore, feedback: r.feedback,
    },
  })) as ScoredProject[]
}

export async function getJudgingLeaderboard(): Promise<LeaderboardEntry[]> {
  const rows = await db
    .select({
      projectId:    projects.id,
      projectTitle: projects.title,
      studentName:  students.fullName,
      domain:       projects.domain,
      avgScore:     sql<number>`ROUND(AVG(${scores.totalScore}), 1)`,
      judgeCount:   count(scores.id),
    })
    .from(scores)
    .innerJoin(projects, eq(scores.projectId, projects.id))
    .innerJoin(students, eq(projects.studentId, students.id))
    .where(isNotNull(scores.totalScore))
    .groupBy(projects.id, projects.title, students.fullName, projects.domain)
    .orderBy(desc(sql`AVG(${scores.totalScore})`))
    .limit(20)

  return rows as LeaderboardEntry[]
}

export async function upsertScore(data: {
  projectId:    string
  judgeId:      string
  innovation:   number
  impact:       number
  technical:    number
  presentation: number
  completeness: number
  totalScore:   number
  feedback?:    string
}): Promise<void> {
  // Check if score already exists for this judge + project
  const existing = await db
    .select({ id: scores.id })
    .from(scores)
    .where(and(eq(scores.projectId, data.projectId), eq(scores.judgeId, data.judgeId)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(scores)
      .set({
        innovation:   data.innovation,
        impact:       data.impact,
        technical:    data.technical,
        presentation: data.presentation,
        completeness: data.completeness,
        totalScore:   data.totalScore,
        feedback:     data.feedback ?? null,
      })
      .where(and(eq(scores.projectId, data.projectId), eq(scores.judgeId, data.judgeId)))
  } else {
    await db.insert(scores).values({
      projectId:    data.projectId,
      judgeId:      data.judgeId,
      innovation:   data.innovation,
      impact:       data.impact,
      technical:    data.technical,
      presentation: data.presentation,
      completeness: data.completeness,
      totalScore:   data.totalScore,
      feedback:     data.feedback ?? null,
    })
  }
}

// ─── Comms / Drop-off queries ─────────────────────────────────────────────────

export interface DropoffCounts {
  stage1Incomplete: number
  quizNotStarted:   number
  notPaid: {
    d1:    number  // 1–2 days since shortlisted
    d2:    number  // 2–3 days
    d3:    number  // 3–4 days
    d4:    number  // 4–5 days
    d5:    number  // 5–6 days
    final: number  // 6+ days
    total: number
  }
}

export async function getDropoffCounts(): Promise<DropoffCounts> {
  const now  = Date.now()
  const h48  = new Date(now - 48 * 3_600_000)
  const h24  = new Date(now - 24 * 3_600_000)

  // Stage 1 incomplete — applied but not submitted after 48h
  const [s1Result] = await db
    .select({ count: count() })
    .from(students)
    .where(and(eq(students.currentStage, '1'), lte(students.createdAt, h48)))

  // Quiz not started — at stage 2 with no attempts, stale > 24h
  const [qResult] = await db
    .select({ count: count() })
    .from(students)
    .leftJoin(quizAttempts, eq(quizAttempts.studentId, students.id))
    .where(
      and(
        eq(students.currentStage, '2'),
        lte(students.updatedAt, h24),
        isNull(quizAttempts.id),
      ),
    )

  // Shortlisted not paid — stage 2 or 3, isPaid=false, grouped by days since updatedAt
  function dayBucket(minDays: number, maxDays: number) {
    return and(
      inArray(students.currentStage, ['2', '3']),
      eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - minDays * 86_400_000)),
      gte(students.updatedAt, new Date(now - maxDays * 86_400_000)),
    )
  }

  const [d1, d2, d3, d4, d5, dFinal, dTotal] = await Promise.all([
    db.select({ count: count() }).from(students).where(dayBucket(1, 2)),
    db.select({ count: count() }).from(students).where(dayBucket(2, 3)),
    db.select({ count: count() }).from(students).where(dayBucket(3, 4)),
    db.select({ count: count() }).from(students).where(dayBucket(4, 5)),
    db.select({ count: count() }).from(students).where(dayBucket(5, 6)),
    db.select({ count: count() }).from(students).where(
      and(inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
        lte(students.updatedAt, new Date(now - 6 * 86_400_000))),
    ),
    db.select({ count: count() }).from(students).where(
      and(inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false)),
    ),
  ])

  return {
    stage1Incomplete: s1Result?.count ?? 0,
    quizNotStarted:   qResult?.count  ?? 0,
    notPaid: {
      d1:    d1[0]?.count    ?? 0,
      d2:    d2[0]?.count    ?? 0,
      d3:    d3[0]?.count    ?? 0,
      d4:    d4[0]?.count    ?? 0,
      d5:    d5[0]?.count    ?? 0,
      final: dFinal[0]?.count ?? 0,
      total: dTotal[0]?.count ?? 0,
    },
  }
}

// Students matching a given trigger type (used by the trigger API)
export async function getStudentsForTrigger(
  triggerType: string,
  segment?:    string,
): Promise<{ id: string; fullName: string; email: string; phone: string | null; city: string | null }[]> {
  const now = Date.now()

  function base() {
    return db.select({
      id: students.id, fullName: students.fullName,
      email: students.email, phone: students.phone, city: students.city,
    }).from(students)
  }

  switch (triggerType) {
    case 'stage1_incomplete':
      return base().where(and(
        eq(students.currentStage, '1'),
        lte(students.createdAt, new Date(now - 48 * 3_600_000)),
      ))

    case 'quiz_not_started': {
      const rows = await db
        .select({ id: students.id, fullName: students.fullName, email: students.email, phone: students.phone, city: students.city })
        .from(students)
        .leftJoin(quizAttempts, eq(quizAttempts.studentId, students.id))
        .where(and(
          eq(students.currentStage, '2'),
          lte(students.updatedAt, new Date(now - 24 * 3_600_000)),
          isNull(quizAttempts.id),
        ))
      return rows
    }

    case 'not_paid_d1': return base().where(and(
      inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - 86_400_000)),
      gte(students.updatedAt, new Date(now - 2 * 86_400_000)),
    ))
    case 'not_paid_d2': return base().where(and(
      inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - 2 * 86_400_000)),
      gte(students.updatedAt, new Date(now - 3 * 86_400_000)),
    ))
    case 'not_paid_d3': return base().where(and(
      inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - 3 * 86_400_000)),
      gte(students.updatedAt, new Date(now - 4 * 86_400_000)),
    ))
    case 'not_paid_d4': return base().where(and(
      inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - 4 * 86_400_000)),
      gte(students.updatedAt, new Date(now - 5 * 86_400_000)),
    ))
    case 'not_paid_d5': return base().where(and(
      inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - 5 * 86_400_000)),
      gte(students.updatedAt, new Date(now - 6 * 86_400_000)),
    ))
    case 'not_paid_final': return base().where(and(
      inArray(students.currentStage, ['2', '3']), eq(students.isPaid, false),
      lte(students.updatedAt, new Date(now - 6 * 86_400_000)),
    ))

    case 'bulk': {
      const conds = []
      if (segment === 'paid')    conds.push(eq(students.isPaid, true))
      if (segment === 'free')    conds.push(eq(students.isPaid, false))
      if (segment === 'premium') conds.push(and(eq(students.tier, 'premium'), eq(students.isPaid, true)))
      if (segment === 'pro')     conds.push(and(eq(students.tier, 'pro'),     eq(students.isPaid, true)))
      if (segment?.startsWith('stage_')) {
        const s = segment.replace('stage_', '') as '1'|'2'|'3'|'4'|'5'
        conds.push(eq(students.currentStage, s))
      }
      return base().where(conds.length > 0 ? and(...conds) : undefined)
    }

    default:
      return []
  }
}

export interface CommsLogEntry {
  id:          string
  studentName: string | null
  template:    string
  recipient:   string
  channel:     string
  status:      string
  createdAt:   Date
}

export async function getCommsLog(limit = 100): Promise<CommsLogEntry[]> {
  const rows = await db
    .select({
      id:          commsLog.id,
      studentName: commsLog.studentName,
      template:    commsLog.template,
      recipient:   commsLog.recipient,
      channel:     commsLog.channel,
      status:      commsLog.status,
      createdAt:   commsLog.createdAt,
    })
    .from(commsLog)
    .orderBy(desc(commsLog.createdAt))
    .limit(limit)

  return rows as CommsLogEntry[]
}

export async function insertCommsLog(entry: {
  studentId?:   string
  studentName?: string
  template:     string
  recipient:    string
  channel:      string
  status:       'sent' | 'failed'
  error?:       string
  triggeredBy?: string
}): Promise<void> {
  await db.insert(commsLog).values({
    studentId:   entry.studentId   ?? null,
    studentName: entry.studentName ?? null,
    template:    entry.template,
    recipient:   entry.recipient,
    channel:     entry.channel,
    status:      entry.status,
    error:       entry.error       ?? null,
    triggeredBy: entry.triggeredBy ?? null,
  })
}
