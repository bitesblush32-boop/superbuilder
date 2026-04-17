import { z } from 'zod'

function calcAge(dob: Date): number {
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--
  return age
}

const indianPhone = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

// Zod v4: custom messages use { error: "..." }, not { errorMap: () => ... }
export const stage1Schema = z.object({
  // ── Student ──────────────────────────────────────────────────────────────
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),

  dateOfBirth: z.coerce.date().refine(
    date => { const age = calcAge(date); return age >= 13 && age <= 18 },
    { message: 'You must be between 13 and 18 years old to participate' },
  ),

  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say'], {
    error: 'Select a gender option',
  }),

  grade: z.enum(['8', '9', '10', '11', '12'], {
    error: 'Select your current grade (8–12)',
  }),

  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  city:       z.string().min(1, 'City is required'),
  state:      z.string().min(1, 'State is required'),
  phone:      indianPhone,

  codingExp: z.enum(['none', 'beginner', 'intermediate', 'advanced'], {
    error: 'Select your coding experience level',
  }),

  interests: z
    .array(z.string().min(1))
    .min(1, 'Select at least one area of interest'),

  teamPreference: z.enum(['solo', 'team', 'no_preference'], {
    error: 'Select a team preference',
  }),

  availabilityHrs: z.enum(['less_than_5', '5_to_10', '10_to_20', 'more_than_20'], {
    error: 'Select your weekly availability',
  }),

  deviceAccess: z.enum(['smartphone', 'laptop', 'desktop', 'tablet', 'multiple'], {
    error: 'Select your primary device',
  }),

  tshirtSize: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    error: 'Select a T-shirt size',
  }),

  instagramHandle: z.string().optional(),
  linkedinHandle:  z.string().optional(),
  referralCode:    z.string().optional(),

  whyJoin: z
    .string()
    .min(20, 'Minimum 20 characters required')
    .max(500, 'Maximum 500 characters allowed'),

  whatToBuild: z
    .string()
    .min(20, 'Minimum 20 characters required')
    .max(500, 'Maximum 500 characters allowed'),

  // ── Parent / Guardian ────────────────────────────────────────────────────
  parent: z.object({
    parentName: z.string().min(2, "Parent's name must be at least 2 characters"),

    relationship: z.enum(['mother', 'father', 'guardian'], {
      error: 'Select relationship to student',
    }),

    parentEmail: z.string().email('Enter a valid email address'),
    parentPhone: indianPhone,

    consentGiven: z.literal(true, {
      error: 'Parental consent is required to proceed',
    }),

    safetyAcknowledged: z.literal(true, {
      error: 'Safety acknowledgement is required to proceed',
    }),

    emergencyContact: z.string().min(1, 'Emergency contact number is required'),
  }),
})

export type Stage1FormData = z.infer<typeof stage1Schema>
