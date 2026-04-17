'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { quizAttempts, ideaSubmissions } from '@/lib/db/schema'
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
import type { BadgeId } from '@/lib/gamification/badges'

// ── Quiz answer keys (MCQ / T-F — exact key match) ───────────────────────────
// Questions 7 and 10 are short-answer; scored by QUIZ_SHORT_ANSWER_MIN_CHARS below
const QUIZ_CORRECT_ANSWERS: Record<number, string> = {
  1: 'b', // Artificial Intelligence
  2: 'b', // Music app recommending songs
  3: 'c', // Conversation partner
  4: 'b', // False — AI cannot think/feel like humans
  5: 'b', // Midjourney
  6: 'b', // Examples the AI learns patterns from
  8: 'b', // Writing clear instructions to get better AI outputs
  9: 'd', // Microsoft Excel (NOT an AI tool)
}
// Short-answer questions: awarded 1 point if answer meets minimum character length
const QUIZ_SHORT_ANSWER_MIN_CHARS: Record<number, number> = {
  7: 10,  // Name one real-world AI application in education
  10: 30, // Why is AI bias a problem?
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
    teamPreference:  form.teamPreference,
    availabilityHrs: form.availabilityHrs,
    deviceAccess:    form.deviceAccess,
    tshirtSize:      form.tshirtSize,
    instagramHandle: form.instagramHandle ?? null,
    linkedinHandle:  form.linkedinHandle  ?? null,
    referredBy:      form.referralCode    ?? null,
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

  // Score quiz — MCQ/T-F: exact key match; short-answer: minimum char length
  const score = answers.reduce((acc, { questionId, answer }) => {
    const minChars = QUIZ_SHORT_ANSWER_MIN_CHARS[questionId]
    if (minChars !== undefined) {
      return acc + (answer.trim().length >= minChars ? 1 : 0)
    }
    return acc + (QUIZ_CORRECT_ANSWERS[questionId] === answer ? 1 : 0)
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

  return { success: true, badgeAwarded: 'IDEA_LAUNCHER' }
}
