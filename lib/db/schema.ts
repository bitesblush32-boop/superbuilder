import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'

export const gradeEnum  = pgEnum('grade', ['8', '9', '10', '11', '12'])
export const tierEnum   = pgEnum('tier', ['pro', 'premium'])
export const stageEnum  = pgEnum('pipeline_stage', ['1', '2', '3', '4', '5'])
export const statusEnum = pgEnum('payment_status', ['pending', 'captured', 'failed', 'refunded'])
export const domainEnum = pgEnum('domain', [
  'health',
  'education',
  'finance',
  'environment',
  'entertainment',
  'social_impact',
  'other',
])

// teams.leaderId FK to students is added via ALTER after both tables exist (circular dep)
export const teams = pgTable('teams', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        varchar('name', { length: 100 }).notNull(),
  code:        varchar('code', { length: 10 }).unique().notNull(), // e.g. "SB-X7K2"
  leaderId:    uuid('leader_id').notNull(),                        // FK added via ALTER after students
  maxSize:     integer('max_size').default(3).notNull(),
  memberCount: integer('member_count').default(1).notNull(),
  isLocked:    boolean('is_locked').default(false).notNull(),      // locked after reg deadline
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

export const appSettings = pgTable('app_settings', {
  key:       varchar('key', { length: 100 }).primaryKey(),
  value:     text('value').notNull(),
  label:     varchar('label', { length: 255 }),  // human-readable label for admin UI
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const students = pgTable('students', {
  id:              uuid('id').primaryKey().defaultRandom(),
  clerkId:         varchar('clerk_id', { length: 255 }).unique().notNull(),
  fullName:        varchar('full_name', { length: 255 }).notNull(),
  email:           varchar('email', { length: 255 }).unique().notNull(),
  phone:           varchar('phone', { length: 20 }),
  grade:           gradeEnum('grade').notNull(),
  schoolName:      text('school_name'),
  city:            varchar('city', { length: 100 }),
  state:           varchar('state', { length: 100 }),
  gender:          varchar('gender', { length: 20 }),
  dateOfBirth:     timestamp('date_of_birth'),
  currentStage:    stageEnum('current_stage').default('1').notNull(),
  tier:            tierEnum('tier'),
  isPaid:          boolean('is_paid').default(false).notNull(),
  xpPoints:        integer('xp_points').default(0).notNull(),
  badges:          jsonb('badges').default([]),
  referralCode:    varchar('referral_code', { length: 20 }).unique(),
  referredBy:      varchar('referred_by', { length: 20 }),
  codingExp:       varchar('coding_exp', { length: 50 }),
  interests:       text('interests').array(),
  // TODO: teamPreference can be dropped in next migration cycle once team system is live
  teamPreference:  varchar('team_preference', { length: 20 }),
  teamId:          uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  teamRole:        varchar('team_role', { length: 20 }), // 'leader' | 'member' | 'solo' | null
  availabilityHrs: varchar('availability_hrs', { length: 20 }),
  deviceAccess:    varchar('device_access', { length: 20 }),
  tshirtSize:      varchar('tshirt_size', { length: 5 }),
  instagramHandle: varchar('instagram_handle', { length: 100 }),
  linkedinHandle:  varchar('linkedin_handle', { length: 100 }),
  discordId:            varchar('discord_id', { length: 100 }),
  certificateUrl:       text('certificate_url'),
  engageAnswers:        jsonb('engage_answers'), // { goal: string, confidence: number, winBoast: string }
  orientationComplete:  boolean('orientation_complete').default(false).notNull(),
  quizPerfect:          boolean('quiz_perfect').default(false).notNull(),
  hackathonDomain:      domainEnum('hackathon_domain'),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().notNull(),
}, t => ({
  cityIdx:  index('students_city_idx').on(t.city),
  stageIdx: index('students_stage_idx').on(t.currentStage),
}))

export const parents = pgTable('parents', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  studentId:          uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  fullName:           varchar('full_name', { length: 255 }).notNull(),
  email:              varchar('email', { length: 255 }).notNull(),
  phone:              varchar('phone', { length: 20 }).notNull(),
  relationship:       varchar('relationship', { length: 50 }),
  consentGiven:       boolean('consent_given').default(false).notNull(),
  consentAt:          timestamp('consent_at'),
  safetyAcknowledged: boolean('safety_acknowledged').default(false).notNull(),
  emergencyContact:   varchar('emergency_contact', { length: 20 }),
  emailVerified:      boolean('email_verified').default(false).notNull(),
  createdAt:          timestamp('created_at').defaultNow(),
})

export const quizAttempts = pgTable('quiz_attempts', {
  id:         uuid('id').primaryKey().defaultRandom(),
  studentId:  uuid('student_id').references(() => students.id).notNull(),
  score:      integer('score').notNull(),
  answers:    jsonb('answers').notNull(),
  passed:     boolean('passed').notNull(),
  attemptNum: integer('attempt_num').default(1).notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
})

export const ideaSubmissions = pgTable('idea_submissions', {
  id:               uuid('id').primaryKey().defaultRandom(),
  studentId:        uuid('student_id').references(() => students.id).notNull(),
  problemStatement: text('problem_statement').notNull(),
  targetUser:       text('target_user').notNull(),
  aiApproach:       text('ai_approach').notNull(),
  domain:           domainEnum('domain').notNull(),
  techStackPref:    varchar('tech_stack_pref', { length: 100 }),
  priorBuildExp:    text('prior_build_exp'),
  createdAt:        timestamp('created_at').defaultNow(),
})

export const payments = pgTable('payments', {
  id:                uuid('id').primaryKey().defaultRandom(),
  studentId:         uuid('student_id').references(() => students.id).notNull(),
  razorpayOrderId:   varchar('razorpay_order_id', { length: 100 }).unique(),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),
  amount:            integer('amount').notNull(), // paise (₹1 = 100 paise)
  tier:              tierEnum('tier'),       // nullable — legacy field, no longer required
  status:            statusEnum('status').default('pending').notNull(),
  isEmi:             boolean('is_emi').default(false),
  emiPhase:          integer('emi_phase').default(1),
  discountPct:       integer('discount_pct').default(0).notNull(), // 0, 10, or 20
  confirmedAt:       timestamp('confirmed_at'),
  createdAt:         timestamp('created_at').defaultNow(),
})

export const projects = pgTable('projects', {
  id:               uuid('id').primaryKey().defaultRandom(),
  studentId:        uuid('student_id').references(() => students.id).notNull(),
  teamId:           uuid('team_id'),
  title:            varchar('title', { length: 255 }).notNull(),
  problemStatement: text('problem_statement').notNull(),
  solutionDesc:     text('solution_desc').notNull(),
  aiTools:          text('ai_tools').array(),
  techStack:        text('tech_stack'),
  domain:           domainEnum('domain').notNull(),
  demoVideoUrl:     text('demo_video_url'),
  githubUrl:        text('github_url'),
  screenshotUrls:   text('screenshot_urls').array(),
  biggestChallenge: text('biggest_challenge'),
  nextSteps:        text('next_steps'),
  submittedAt:      timestamp('submitted_at'),
  createdAt:        timestamp('created_at').defaultNow(),
})

export const scores = pgTable('scores', {
  id:           uuid('id').primaryKey().defaultRandom(),
  projectId:    uuid('project_id').references(() => projects.id).notNull(),
  judgeId:      uuid('judge_id').notNull(),
  innovation:   integer('innovation'),    // max 25
  impact:       integer('impact'),        // max 25
  technical:    integer('technical'),     // max 25
  presentation: integer('presentation'), // max 15
  completeness: integer('completeness'), // max 10
  totalScore:   integer('total_score'),
  feedback:     text('feedback'),
  createdAt:    timestamp('created_at').defaultNow(),
})

export const referrals = pgTable('referrals', {
  id:          uuid('id').primaryKey().defaultRandom(),
  referrerId:  uuid('referrer_id').references(() => students.id).notNull(),
  refereeId:   uuid('referee_id').references(() => students.id).notNull(),
  paid:        boolean('paid').default(false),
  voucherSent: boolean('voucher_sent').default(false),
  createdAt:   timestamp('created_at').defaultNow(),
})

export const workshopAttendance = pgTable('workshop_attendance', {
  id:            uuid('id').primaryKey().defaultRandom(),
  studentId:     uuid('student_id').references(() => students.id).notNull(),
  workshopNum:   integer('workshop_num').notNull(), // 1, 2, or 3
  attended:      boolean('attended').default(false),
  watchedReplay: boolean('watched_replay').default(false),
  xpAwarded:     boolean('xp_awarded').default(false),
  createdAt:     timestamp('created_at').defaultNow(),
})

export const commsLog = pgTable('comms_log', {
  id:          uuid('id').primaryKey().defaultRandom(),
  studentId:   uuid('student_id').references(() => students.id, { onDelete: 'set null' }),
  studentName: varchar('student_name', { length: 255 }),
  template:    varchar('template', { length: 100 }).notNull(),
  recipient:   varchar('recipient', { length: 255 }).notNull(), // email or E.164 phone
  channel:     varchar('channel', { length: 20 }).notNull(),    // 'email' | 'whatsapp'
  status:      varchar('status', { length: 20 }).notNull().default('sent'), // 'sent' | 'failed'
  error:       text('error'),
  triggeredBy: varchar('triggered_by', { length: 255 }),  // admin Clerk userId
  createdAt:   timestamp('created_at').defaultNow().notNull(),
}, t => ({
  createdAtIdx: index('comms_log_created_at_idx').on(t.createdAt),
}))

export const programmeConfig = pgTable('programme_config', {
  section:   varchar('section', { length: 50 }).primaryKey(),
  data:      jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const scheduleItems = pgTable('schedule_items', {
  id:            uuid('id').primaryKey().defaultRandom(),
  type:          varchar('type', { length: 20 }).notNull(),  // 'video' | 'meeting' | 'resource'
  title:         varchar('title', { length: 255 }).notNull(),
  description:   text('description'),
  url:           text('url'),
  targetStage:   varchar('target_stage', { length: 20 }),   // '1','2','3','4','dashboard','all'
  targetSection: varchar('target_section', { length: 50 }), // 'workshop_1','workshop_2','workshop_3','general'
  scheduledAt:   timestamp('scheduled_at', { withTimezone: true }),
  durationMins:  integer('duration_mins'),
  isVisible:     boolean('is_visible').default(true).notNull(),
  notifySent:    boolean('notify_sent').default(false).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
  updatedAt:     timestamp('updated_at').defaultNow().notNull(),
})
