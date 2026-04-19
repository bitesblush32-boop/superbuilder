'use server'

import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { students, quizAttempts, ideaSubmissions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { stage1Schema }            from '@/lib/validation/stage1'
import { quizSchema, ideaSchema }  from '@/lib/validation/stage2'
import {
  getStudentByClerkId,
  createStudent,
  addBadgeToStudent,
  updateStudentStage,
  updateStudentEngageAnswers,
  generateReferralCode,
} from '@/lib/db/queries/students'
import { createParent } from '@/lib/db/queries/parents'
import { createTeam, joinTeam, leaveTeam, getTeamWithMembers } from '@/lib/db/queries/teams'
import type { BadgeId } from '@/lib/gamification/badges'
import { CORRECT_ANSWERS, SHORT_ANSWER_MIN } from '@/lib/content/quizQuestions'

const VALID_DOMAINS = ['health','education','finance','environment','entertainment','social_impact'] as const

// ─────────────────────────────────────────────────────────────────────────────
// completeOrientation
// Marks orientationComplete = true on the student record
// ─────────────────────────────────────────────────────────────────────────────
export async function completeOrientation(): Promise<{ success: boolean }> {
  const { userId } = await auth()
  if (!userId) return { success: false }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false }

  await db
    .update(students)
    .set({ orientationComplete: true, updatedAt: new Date() })
    .where(eq(students.id, student.id))

  revalidatePath('/register')

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// selectDomain
// Locks the student's hackathon domain — can only be set once
// ─────────────────────────────────────────────────────────────────────────────
export async function selectDomain(domain: string): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false, error: 'Student not found' }
  if (!student.orientationComplete) return { success: false, error: 'Complete orientation first' }
  if (student.hackathonDomain) return { success: false, error: 'Domain already selected' }

  if (!(VALID_DOMAINS as readonly string[]).includes(domain)) {
    return { success: false, error: 'Invalid domain' }
  }

  await db
    .update(students)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .set({ hackathonDomain: domain as any, updatedAt: new Date() })
    .where(eq(students.id, student.id))

  revalidatePath('/register')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// submitStage1
// Creates student + parent records, awards Explorer badge, advances to stage 2
// ─────────────────────────────────────────────────────────────────────────────
export async function submitStage1(data: unknown): Promise<{
  success: boolean
  error?: string
  badgeAwarded?: BadgeId
}> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  // Validate form data
  const parsed = stage1Schema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? 'Validation error' }
  }

  const form = parsed.data

  // Prevent duplicate submissions
  const existing = await getStudentByClerkId(userId)
  if (existing) {
    return { success: false, error: 'Application already submitted' }
  }

  // Fetch verified email from Clerk
  const clerkUser = await currentUser()
  const email     = clerkUser?.emailAddresses?.[0]?.emailAddress
  if (!email) return { success: false, error: 'Unable to retrieve your email from Clerk' }

  // Generate unique referral code (collision unlikely; add DB retry loop for production)
  const referralCode = generateReferralCode()

  // Insert student
  const student = await createStudent({
    clerkId:         userId,
    email,
    fullName:        form.fullName,
    dateOfBirth:     form.dateOfBirth,
    gender:          form.gender,
    grade:           form.grade,
    schoolName:      form.schoolName,
    city:            form.city,
    state:           form.state,
    phone:           form.phone,
    codingExp:       form.codingExp,
    interests:       form.interests,
    availabilityHrs: form.availabilityHrs,
    deviceAccess:    form.deviceAccess,
    tshirtSize:      form.tshirtSize,
    instagramHandle: form.instagramHandle ?? null,
    linkedinHandle:  form.linkedinHandle  ?? null,
    referredBy:      null,
    referralCode,
    currentStage:    '1', // will be advanced below
  })

  // Insert parent record
  await createParent({
    studentId:          student.id,
    fullName:           form.parent.parentName,
    email:              form.parent.parentEmail,
    phone:              form.parent.parentPhone,
    relationship:       form.parent.relationship,
    consentGiven:       form.parent.consentGiven as boolean,
    consentAt:          new Date(),
    safetyAcknowledged: form.parent.safetyAcknowledged as boolean,
    emergencyContact:   form.parent.emergencyContact,
  })

  // Award Explorer badge + 50 XP, then advance to stage 2
  await addBadgeToStudent(student.id, 'explorer', 50)
  await updateStudentStage(student.id, '2')
  // NOTE: no revalidatePath here — it would trigger a page re-render that runs
  // getStudentOrRedirect(1), detects stage=2, and redirects before the badge
  // unlock + team selection screens can show. The /register layout is
  // force-dynamic so it always fetches fresh data on the next navigation.

  return { success: true, badgeAwarded: 'EXPLORER' }
}

// ─────────────────────────────────────────────────────────────────────────────
// submitQuiz
// Scores quiz, records attempt, awards AI_CURIOUS badge on pass
// ─────────────────────────────────────────────────────────────────────────────
export async function submitQuiz(data: unknown): Promise<{
  passed: boolean
  score: number
  error?: string
  badgeAwarded?: BadgeId
}> {
  const { userId } = await auth()
  if (!userId) return { passed: false, score: 0, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { passed: false, score: 0, error: 'Student record not found' }

  // Validate answers
  const parsed = quizSchema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { passed: false, score: 0, error: first?.message ?? 'Validation error' }
  }

  const { answers } = parsed.data

  // Enforce max 2 attempts (security rule from CLAUDE.md §21)
  const [{ value: attemptCount }] = await db
    .select({ value: count() })
    .from(quizAttempts)
    .where(eq(quizAttempts.studentId, student.id))

  if (attemptCount >= 2) {
    return { passed: false, score: 0, error: 'Maximum quiz attempts reached' }
  }

  // Domain-aware scoring
  const domain       = student.hackathonDomain ?? 'health'
  const correctAnswers = CORRECT_ANSWERS[domain] ?? {}

  // Score quiz — MCQ/T-F: exact key match; short-answer: minimum char length
  const score = answers.reduce((acc, { questionId, answer }) => {
    const minChars = SHORT_ANSWER_MIN[questionId]
    if (minChars !== undefined) {
      return acc + (answer.trim().length >= minChars ? 1 : 0)
    }
    return acc + (correctAnswers[questionId] === answer ? 1 : 0)
  }, 0)

  const passed     = score >= 6
  const attemptNum = Number(attemptCount) + 1

  // Persist attempt
  await db.insert(quizAttempts).values({
    studentId:  student.id,
    score,
    answers:    answers as unknown as Record<string, unknown>[],
    passed,
    attemptNum,
  })

  if (!passed) return { passed: false, score }

  // Award AI_CURIOUS badge + 100 XP on first pass
  await addBadgeToStudent(student.id, 'ai_curious', 100)

  return { passed: true, score, badgeAwarded: 'AI_CURIOUS' }
}

// ─────────────────────────────────────────────────────────────────────────────
// submitEngage
// Saves the 3 pre-payment engage answers to the student record
// ─────────────────────────────────────────────────────────────────────────────
export async function submitEngage(data: {
  goal:       string
  confidence: number
  winBoast:   string
}): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false, error: 'Student record not found' }

  if (!data.goal?.trim() || data.confidence < 1 || data.confidence > 5 || !data.winBoast?.trim()) {
    return { success: false, error: 'All three questions are required' }
  }

  await updateStudentEngageAnswers(student.id, {
    goal:       data.goal.trim().slice(0, 400),
    confidence: data.confidence,
    winBoast:   data.winBoast.trim().slice(0, 200),
  })

  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// submitIdea
// Persists idea submission, awards Idea Launcher badge, advances to stage 3
// ─────────────────────────────────────────────────────────────────────────────
export async function submitIdea(data: unknown): Promise<{
  success: boolean
  error?: string
  badgeAwarded?: BadgeId
}> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false, error: 'Student record not found' }

  // Validate idea form
  const parsed = ideaSchema.safeParse(data)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? 'Validation error' }
  }

  const form = parsed.data

  await db.insert(ideaSubmissions).values({
    studentId:        student.id,
    problemStatement: form.problemStatement,
    targetUser:       form.targetUser,
    aiApproach:       form.aiApproach,
    domain:           form.domain,
    techStackPref:    form.techStackPref ?? null,
    priorBuildExp:    form.priorBuildExp ?? null,
  })

  // Award Idea Launcher badge + 75 XP, advance to stage 3
  await addBadgeToStudent(student.id, 'idea_launcher', 75)
  await updateStudentStage(student.id, '3')
  
  revalidatePath('/register')

  return { success: true, badgeAwarded: 'IDEA_LAUNCHER' }
}

// ─────────────────────────────────────────────────────────────────────────────
// createStudentTeam
// Called after Stage 1 completes — student picks "create team"
// ─────────────────────────────────────────────────────────────────────────────
export async function createStudentTeam(teamName: string): Promise<{
  success: boolean
  error?: string
  teamCode?: string
}> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false, error: 'Student not found' }
  if (student.teamId) return { success: false, error: 'Already in a team' }
  if (!teamName.trim() || teamName.trim().length < 2)
    return { success: false, error: 'Team name must be at least 2 characters' }

  const team = await createTeam(student.id, teamName)
  return { success: true, teamCode: team.code }
}

// ─────────────────────────────────────────────────────────────────────────────
// joinStudentTeam
// Called after Stage 1 completes — student picks "join team"
// ─────────────────────────────────────────────────────────────────────────────
export async function joinStudentTeam(code: string): Promise<{
  success: boolean
  error?: string
  teamName?: string
  memberCount?: number
}> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false, error: 'Student not found' }

  const result = await joinTeam(student.id, code)
  if (!result.success) return result
  return {
    success: true,
    teamName: result.team?.name,
    memberCount: result.team?.memberCount,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// leaveStudentTeam
// Called from the team management page — student leaves or dissolves their team
// ─────────────────────────────────────────────────────────────────────────────
export async function leaveStudentTeam(): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Not authenticated' }

  const student = await getStudentByClerkId(userId)
  if (!student) return { success: false, error: 'Student not found' }

  return leaveTeam(student.id)
}

// ─────────────────────────────────────────────────────────────────────────────
// getMyTeamInfo
// Returns current student's team info (for team management page)
// ─────────────────────────────────────────────────────────────────────────────
export async function getMyTeamInfo(): Promise<{
  student: { id: string; teamId: string | null; teamRole: string | null; fullName: string } | null
  team: Awaited<ReturnType<typeof getTeamWithMembers>>
}> {
  const { userId } = await auth()
  if (!userId) return { student: null, team: null }

  const student = await getStudentByClerkId(userId)
  if (!student) return { student: null, team: null }

  const team = student.teamId ? await getTeamWithMembers(student.teamId) : null
  return {
    student: { id: student.id, teamId: student.teamId, teamRole: student.teamRole, fullName: student.fullName },
    team,
  }
}
