import { z } from 'zod'

// ── Quiz ─────────────────────────────────────────────────────────────────────

export const quizAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(10),
  answer:     z.string().min(1, 'Answer is required'),
})

export const quizSchema = z.object({
  answers: z
    .array(quizAnswerSchema)
    .length(10, 'All 10 questions must be answered'),
})

// ── Idea submission ───────────────────────────────────────────────────────────

export const ideaSchema = z.object({
  problemStatement: z
    .string()
    .min(50,   'Minimum 50 characters required')
    .max(1000, 'Maximum 1000 characters allowed'),

  targetUser: z
    .string()
    .min(20,  'Minimum 20 characters required')
    .max(500, 'Maximum 500 characters allowed'),

  aiApproach: z
    .string()
    .min(20,  'Minimum 20 characters required')
    .max(500, 'Maximum 500 characters allowed'),

  domain: z.enum(
    ['health', 'education', 'finance', 'environment', 'entertainment', 'social_impact', 'other'],
    { error: 'Select a domain' },
  ),

  techStackPref:  z.string().optional(),
  priorBuildExp:  z.string().optional(),
})

export type QuizFormData = z.infer<typeof quizSchema>
export type IdeaFormData  = z.infer<typeof ideaSchema>
