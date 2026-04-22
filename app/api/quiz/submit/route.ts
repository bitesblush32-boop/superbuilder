// POST /api/quiz/submit
// Scores quiz, enforces max 2 attempts via Upstash Redis counter, awards XP + badge

import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { quizAttempts, students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redis } from '@/lib/redis'
import { getStudentByClerkId } from '@/lib/db/queries/students'
import { awardXPAndBadge } from '@/lib/gamification/xp'
import { CORRECT_ANSWERS, SHORT_ANSWER_MIN } from '@/lib/content/quizQuestions'
import { quizSchema } from '@/lib/validation/stage2'
import type { BadgeId } from '@/lib/gamification/badges'

const PASS_THRESHOLD = 6
const MAX_ATTEMPTS   = 2

// ─── Scorer ──────────────────────────────────────────────────────────────────
// Questions 1–8: MCQ/TF — compare answer key to CORRECT_ANSWERS[domain]
// Questions 9–10: short answer — pass if chars >= SHORT_ANSWER_MIN threshold
function scoreQuiz(
  domain: string,
  answers: { questionId: number; answer: string }[],
): number {
  const correct = CORRECT_ANSWERS[domain] ?? {}
  let score = 0
  for (const { questionId, answer } of answers) {
    if (questionId <= 8) {
      if (answer === correct[questionId]) score++
    } else {
      const min = SHORT_ANSWER_MIN[questionId] ?? 10
      if (answer.trim().length >= min) score++
    }
  }
  return score
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // 1 — Auth
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const student = await getStudentByClerkId(userId)
  if (!student) return Response.json({ error: 'Student not found' }, { status: 404 })

  if (!student.hackathonDomain) {
    return Response.json({ error: 'Select your domain before taking the quiz' }, { status: 400 })
  }

  // 2 — Redis attempt gate (atomic INCR → safe under concurrent requests)
  const attemptKey = `quiz:attempts:${student.id}`
  const attemptNum = await redis.incr(attemptKey)
  // Set 24h TTL only on the first increment (so key auto-expires each day)
  if (attemptNum === 1) await redis.expire(attemptKey, 86_400)

  if (attemptNum > MAX_ATTEMPTS) {
    return Response.json(
      { error: 'You have used all 2 quiz attempts. Contact support if you need help.' },
      { status: 429 },
    )
  }

  // 3 — Validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = quizSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { answers } = parsed.data

  // 4 — Score
  const score  = scoreQuiz(student.hackathonDomain, answers)
  const passed = score >= PASS_THRESHOLD

  // 5 — Persist attempt to DB
  await db.insert(quizAttempts).values({
    studentId:  student.id,
    score,
    answers:    answers as unknown as Record<string, unknown>[],
    passed,
    attemptNum,
  })

  // 6 — Award XP + badge on first pass only
  let badgeAwarded: BadgeId | null = null
  if (passed) {
    const alreadyHasBadge =
      Array.isArray(student.badges) && (student.badges as string[]).includes('AI_CURIOUS')

    if (!alreadyHasBadge) {
      await awardXPAndBadge(student.id, 100, 'AI_CURIOUS')
      badgeAwarded = 'AI_CURIOUS'
    }

    // Advance student within stage 2 — they can now access idea submission
    // (currentStage stays '2'; sub-routing in getStudentOrRedirect reads quizAttempts)
    await db
      .update(students)
      .set({ updatedAt: new Date() })
      .where(eq(students.id, student.id))
  }

  return Response.json({
    score,
    total: 10,
    passed,
    badgeAwarded,
    attemptsUsed:      attemptNum,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attemptNum),
  })
}
