@AGENTS.md
# CLAUDE.md — Super Builders × zer0.pro
## Complete Development Reference for Claude Code

> Read this entire file before writing a single line of code.
> This is the single source of truth. Nothing overrides it.

---

## 1. PROJECT OVERVIEW

**Super Builders — School Edition** is a full-stack web platform for zer0.pro's AI summer hackathon programme targeting **Indian school students aged 13–18 (Class 8–12)**.

The platform handles the **complete participant journey**:
```
Landing Page → Registration → AI Quiz → Payment → Dashboard → Build → Submit → Judge → Certificate
```

### Key facts
| Field | Value |
|-------|-------|
| Organiser | zer0.pro |
| Audience | Students Class 8–12 (age 13–18) + Parents (payment decision-makers) |
| Format | 100% online |
| Season | 1 — 2025 |
| Target | 2,000–3,000 paid students |
| Prize pool | ₹1,00,000+ |
| Registration deadline | May 25 |
| Hackathon | Jun 7 8am → Jun 8 8am IST (24h) |
| Results + Certificates | Jun 9–10 |

---

## 2. TARGET AUDIENCE — DESIGN NORTH STAR

This section is mandatory reading before designing or building any screen.

### Who we are building for: Indian teens aged 13–18

**Behavioural profile:**
- Primary device: budget Android smartphone (Redmi, Realme, Moto — often 3–4GB RAM)
- Connection: Jio/Airtel 4G, sometimes 3G in tier-2/3 cities
- Average attention span on a new app: ~8 seconds before drop-off
- Communication channels: WhatsApp (primary), Instagram (discovery), YouTube (learning)
- Competitive: love leaderboards, rankings, public recognition
- Social proof driven: "X students from my city joined" is more compelling than feature lists
- Reward-motivated: badges, XP, levels, streaks — they are Duolingo-native users
- Peer-validated: sign up when friends sign up. Referral = natural behaviour
- Parent-mediated payments: student is excited, parent must approve

**Design implications — enforce these everywhere:**

```
MOBILE FIRST — not mobile-compatible. Design for 375px first.
Touch targets minimum 44×44px. Never smaller.
No hover-dependent interactions — hover doesn't exist on phone.
Tap → instant feedback (< 100ms). No spinner unless > 1 second wait.
Vertical scrolling only. No horizontal scroll except explicit carousels.
Font sizes: minimum 14px body, 16px inputs (prevents iOS zoom on focus).
Progress always visible — "Step 2 of 5" or progress bar — never lost.
```

**Emotional design targets by age group:**

| Age | What resonates | Avoid |
|-----|---------------|-------|
| 13–14 (Class 8–9) | Fun, discovery, safe community, "your first hackathon" framing | Complexity, technical jargon, corporate tone |
| 15–16 (Class 10–11) | Competition, skill-building, "future career" framing, peer comparison | Talking down to them, oversimplification |
| 17–18 (Class 12) | Portfolio-building, LinkedIn, college application edge, real mentors | Anything that feels like a "kids programme" |

**Visual language for 13–18 year olds:**
- Dark mode strongly preferred (they hate white screens)
- High contrast — they are on bright screens in outdoor environments
- Bold display typography — Bebas Neue for impact, Exo 2 for headings
- Gold + black is aspirational (trophy, achievement) — not corporate
- Animations must be snappy: 200–350ms. Longer = laggy to them
- Emojis are natural UI elements in this age group — use them in copy
- Progress is a game mechanic — XP bars, level-ups, badge unlocks
- Peer names visible on leaderboard = social pressure = good

**Parent-facing sections — completely different tone:**
- Clean, readable sections (within the dark page)
- Credential-heavy: zer0.pro verified, judge affiliations
- Safety-first messaging
- Outcome statistics ("90% build a working prototype")
- Refund policy prominent
- WhatsApp group for parents — reduces anxiety

---

## 3. TECH STACK

### Frontend
| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js App Router | 15+ |
| Language | TypeScript | 5+ |
| CSS | Tailwind CSS | 4 |
| Components | shadcn/ui | latest |
| Animation | Framer Motion | 11+ |
| Badge animations | lottie-react | latest |
| Stage completion | canvas-confetti | latest |
| Forms | React Hook Form + Zod | latest |
| Client state | Zustand | latest |
| Server state | TanStack Query | 5+ |
| 3D (hero) | Three.js | r128 |

### Backend / Infrastructure — Railway
| Layer | Choice | Notes |
|-------|--------|-------|
| Hosting | Railway | App server + DB on same platform |
| Database | PostgreSQL on Railway | Provisioned directly in Railway project |
| ORM | Drizzle ORM | SQL-first, TypeScript-native |
| Auth | Clerk | Standalone, not DB-coupled. Free up to 10K MAU |
| File storage | Cloudflare R2 | Zero egress. Project screenshots, cert PDFs, OG images |
| Cache / Leaderboard | Upstash Redis | Sorted sets for live rankings |
| Real-time | SSE + Upstash Redis | Server-Sent Events for hackathon live feed |
| Payments | Razorpay | UPI + Cards + Netbanking. Indian-first |
| WhatsApp (transactional) | Meta WhatsApp Cloud API | Confirmations, status updates |
| WhatsApp (marketing/bulk) | Interakt (Jio Haptik) | Bulk parent broadcasts |
| Email (transactional) | Resend | Developer-friendly, 3K/month free |
| Email (bulk) | Amazon SES (Mumbai region) | ₹0.10/1K emails |
| Monitoring | Sentry | Error tracking |
| Analytics | Plausible | Privacy-friendly, lightweight |

### Railway-specific setup
```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export const db = drizzle(pool, { schema })
```

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit'
export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'pg',
  dbCredentials: { connectionString: process.env.DATABASE_URL! },
} satisfies Config
```

---

## 4. RENDERING STRATEGY

| Page | Strategy | Rationale |
|------|----------|-----------|
| `/` landing | SSG + ISR (revalidate: 3600) | SEO-critical. Serves from CDN. Handles 10K+ concurrent with zero server load. |
| `/register/*` | SSR (Server Components) | Dynamic, personalised, form-heavy, stage-gated |
| `/quiz` | SSR shell + Client state | Server renders shell, React handles quiz timer + answer state |
| `/dashboard/*` | SSR + streaming | Auth-protected, personalised, parallel streamed widgets |
| `/dashboard/leaderboard` | SSR + SSE | Initial SSR, then SSE subscription for live updates |
| `/admin/*` | SSR | Internal only, no SEO, heavy data tables |
| `/api/*` | Route Handlers | All DB operations. Never call DB from client components. |

**Critical rule:** DB calls ONLY in Server Components, Server Actions, or Route Handlers. Never `use client` + direct DB access.

---

## 5. FILE STRUCTURE

```
super-builders/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Landing page — SSG/ISR
│   │   └── _components/
│   │       ├── HeroSection.tsx
│   │       ├── StatsBar.tsx
│   │       ├── ProgrammeTimeline.tsx
│   │       ├── WorkshopCards.tsx
│   │       ├── TierComparison.tsx
│   │       ├── BadgeWall.tsx
│   │       ├── ForParents.tsx
│   │       ├── JudgingCriteria.tsx
│   │       ├── DomainGrid.tsx
│   │       ├── FAQ.tsx
│   │       └── FinalCTA.tsx
│   │
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── register/
│   │   ├── layout.tsx               # Stage progress bar header
│   │   ├── page.tsx                 # Redirect to current stage
│   │   ├── stage-1/page.tsx         # Application + parental consent
│   │   ├── stage-2/
│   │   │   ├── quiz/page.tsx
│   │   │   └── idea/page.tsx
│   │   ├── stage-3/
│   │   │   ├── engage/page.tsx      # 3 pre-payment questions
│   │   │   ├── select/page.tsx      # Tier selection
│   │   │   └── pay/page.tsx         # Razorpay checkout
│   │   └── success/page.tsx
│   │
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── workshops/page.tsx
│   │   ├── mentors/page.tsx         # Premium only
│   │   ├── team/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── submit/page.tsx
│   │   └── certificate/page.tsx     # Post Jun 10
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── students/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── judging/page.tsx
│   │   └── comms/page.tsx
│   │
│   └── api/
│       ├── webhooks/
│       │   ├── razorpay/route.ts
│       │   └── clerk/route.ts
│       ├── registration/[stage]/route.ts
│       ├── quiz/submit/route.ts
│       ├── quiz/retake/route.ts
│       ├── leaderboard/stream/route.ts  # SSE
│       ├── payments/create-order/route.ts
│       └── certificates/generate/route.ts
│
├── components/
│   ├── ui/                          # shadcn/ui — do not edit
│   ├── gamification/
│   │   ├── BadgeUnlock.tsx
│   │   ├── BadgeWall.tsx
│   │   ├── XPBar.tsx
│   │   ├── StageProgress.tsx
│   │   ├── Leaderboard.tsx
│   │   └── CountdownTimer.tsx
│   ├── forms/
│   │   ├── ApplicationForm.tsx
│   │   ├── ParentConsentForm.tsx
│   │   ├── QuizForm.tsx
│   │   ├── IdeaForm.tsx
│   │   ├── TierSelectForm.tsx
│   │   └── ProjectSubmitForm.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardShell.tsx
│   └── three/
│       ├── HeroBadge.tsx
│       └── ParticleField.tsx
│
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   ├── migrations/
│   │   └── queries/
│   │       ├── students.ts
│   │       ├── payments.ts
│   │       ├── projects.ts
│   │       └── leaderboard.ts
│   ├── razorpay/index.ts
│   ├── gamification/
│   │   ├── badges.ts
│   │   └── xp.ts
│   ├── email/templates/
│   ├── whatsapp/index.ts
│   └── redis/index.ts
│
├── hooks/
│   ├── useCountdown.ts
│   ├── useLeaderboard.ts
│   ├── useBadgeUnlock.ts
│   └── useDeviceCapability.ts
│
├── styles/globals.css
├── public/
│   ├── badges/                      # Lottie JSON
│   ├── og/
│   └── logo/
│
├── CLAUDE.md
├── drizzle.config.ts
├── middleware.ts
└── next.config.ts
```

---

## 6. DESIGN SYSTEM TOKENS

Add to `styles/globals.css` under `@layer base`:

```css
:root {
  --brand:          #FFB800;
  --brand-bright:   #FFCF40;
  --brand-dim:      #CC9400;
  --brand-dark:     #7A5500;
  --brand-glow:     rgba(255, 184, 0, 0.20);
  --brand-subtle:   rgba(255, 184, 0, 0.07);

  --bg-void:   #000000;
  --bg-base:   #0A0A0A;
  --bg-raised: #111111;
  --bg-card:   #161616;
  --bg-float:  #1E1E1E;
  --bg-inset:  #0D0D0D;

  --border-faint:        rgba(255,255,255,0.05);
  --border-subtle:       rgba(255,255,255,0.09);
  --border-soft:         rgba(255,255,255,0.15);
  --border-brand:        rgba(255,184,0,0.30);
  --border-brand-strong: rgba(255,184,0,0.60);

  --text-1:     #FFFFFF;
  --text-2:     #C0C0C0;
  --text-3:     #808080;
  --text-4:     #484848;
  --text-brand: #FFB800;

  --green:   #22C55E; --green-bg:  rgba(34,197,94,0.10);
  --blue:    #60A5FA; --blue-bg:   rgba(96,165,250,0.10);
  --red:     #F87171; --red-bg:    rgba(248,113,113,0.10);
  --purple:  #C084FC; --purple-bg: rgba(192,132,252,0.10);
  --amber:   #FBBF24; --amber-bg:  rgba(251,191,36,0.10);

  --bdg-explorer:   #A78BFA;
  --bdg-curious:    #60A5FA;
  --bdg-launcher:   #34D399;
  --bdg-builder:    #FFB800;
  --bdg-warrior:    #FB923C;
  --bdg-expert:     #E879F9;
  --bdg-proto:      #818CF8;
  --bdg-hacker:     #4ADE80;
  --bdg-super:      #FFD700;

  --font-display: 'Bebas Neue', Impact, sans-serif;
  --font-heading: 'Exo 2', sans-serif;
  --font-body:    'Plus Jakarta Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out:    cubic-bezier(0.16, 1, 0.30, 1);
  --ease-in-out: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.27, 1.55);
  --dur-instant: 100ms; --dur-fast: 150ms;
  --dur-normal: 250ms;  --dur-slow: 400ms; --dur-xslow: 600ms;

  --shadow-brand:    0 0 32px rgba(255,184,0,0.25);
  --shadow-brand-sm: 0 0 12px rgba(255,184,0,0.15);
}
```

Tailwind config (`tailwind.config.ts`):
```typescript
theme: {
  extend: {
    colors: {
      brand: { DEFAULT: '#FFB800', bright: '#FFCF40', dim: '#CC9400' },
      bg: { void: '#000', base: '#0A0A0A', raised: '#111', card: '#161616', float: '#1E1E1E', inset: '#0D0D0D' },
    },
    fontFamily: {
      display: ['Bebas Neue', 'Impact', 'sans-serif'],
      heading:  ['Exo 2', 'sans-serif'],
      body:     ['Plus Jakarta Sans', 'sans-serif'],
      mono:     ['JetBrains Mono', 'monospace'],
    },
  }
}
```

Font loading — always `next/font` to eliminate CLS:
```typescript
import { Bebas_Neue, Exo_2, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
const bebasNeue   = Bebas_Neue({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-display' })
const exo2        = Exo_2({ subsets: ['latin'], display: 'swap', variable: '--font-heading' })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-body' })
const jetbrains   = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' })
```

---

## 7. DATABASE SCHEMA (Drizzle + Railway PostgreSQL)

```typescript
// lib/db/schema.ts
import { pgTable, uuid, varchar, text, integer, boolean,
         timestamp, pgEnum, jsonb, index } from 'drizzle-orm/pg-core'

export const gradeEnum   = pgEnum('grade', ['8','9','10','11','12'])
export const tierEnum    = pgEnum('tier',  ['pro','premium'])
export const stageEnum   = pgEnum('pipeline_stage', ['1','2','3','4','5'])
export const statusEnum  = pgEnum('payment_status', ['pending','captured','failed','refunded'])
export const domainEnum  = pgEnum('domain', ['health','education','finance','environment','entertainment','social_impact','other'])

export const students = pgTable('students', {
  id:               uuid('id').primaryKey().defaultRandom(),
  clerkId:          varchar('clerk_id', {length:255}).unique().notNull(),
  fullName:         varchar('full_name', {length:255}).notNull(),
  email:            varchar('email', {length:255}).unique().notNull(),
  phone:            varchar('phone', {length:20}),
  grade:            gradeEnum('grade').notNull(),
  schoolName:       text('school_name'),
  city:             varchar('city', {length:100}),
  state:            varchar('state', {length:100}),
  gender:           varchar('gender', {length:20}),
  dateOfBirth:      timestamp('date_of_birth'),
  currentStage:     stageEnum('current_stage').default('1').notNull(),
  tier:             tierEnum('tier'),
  isPaid:           boolean('is_paid').default(false).notNull(),
  xpPoints:         integer('xp_points').default(0).notNull(),
  badges:           jsonb('badges').default([]),
  referralCode:     varchar('referral_code', {length:20}).unique(),
  referredBy:       varchar('referred_by', {length:20}),
  codingExp:        varchar('coding_exp', {length:50}),
  interests:        text('interests').array(),
  teamPreference:   varchar('team_preference', {length:20}),
  availabilityHrs:  varchar('availability_hrs', {length:20}),
  deviceAccess:     varchar('device_access', {length:20}),
  tshirtSize:       varchar('tshirt_size', {length:5}),
  instagramHandle:  varchar('instagram_handle', {length:100}),
  linkedinHandle:   varchar('linkedin_handle', {length:100}),
  discordId:        varchar('discord_id', {length:100}),
  certificateUrl:   text('certificate_url'),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
}, t => ({
  cityIdx:  index('students_city_idx').on(t.city),
  stageIdx: index('students_stage_idx').on(t.currentStage),
}))

export const parents = pgTable('parents', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  studentId:          uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  fullName:           varchar('full_name', {length:255}).notNull(),
  email:              varchar('email', {length:255}).notNull(),
  phone:              varchar('phone', {length:20}).notNull(),
  relationship:       varchar('relationship', {length:50}),
  consentGiven:       boolean('consent_given').default(false).notNull(),
  consentAt:          timestamp('consent_at'),
  safetyAcknowledged: boolean('safety_acknowledged').default(false).notNull(),
  emergencyContact:   varchar('emergency_contact', {length:20}),
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
  techStackPref:    varchar('tech_stack_pref', {length:100}),
  priorBuildExp:    text('prior_build_exp'),
  createdAt:        timestamp('created_at').defaultNow(),
})

export const payments = pgTable('payments', {
  id:                uuid('id').primaryKey().defaultRandom(),
  studentId:         uuid('student_id').references(() => students.id).notNull(),
  razorpayOrderId:   varchar('razorpay_order_id', {length:100}).unique(),
  razorpayPaymentId: varchar('razorpay_payment_id', {length:100}),
  amount:            integer('amount').notNull(),  // paise (₹1 = 100 paise)
  tier:              tierEnum('tier').notNull(),
  status:            statusEnum('status').default('pending').notNull(),
  isEmi:             boolean('is_emi').default(false),
  emiPhase:          integer('emi_phase').default(1),
  confirmedAt:       timestamp('confirmed_at'),
  createdAt:         timestamp('created_at').defaultNow(),
})

export const projects = pgTable('projects', {
  id:               uuid('id').primaryKey().defaultRandom(),
  studentId:        uuid('student_id').references(() => students.id).notNull(),
  teamId:           uuid('team_id'),
  title:            varchar('title', {length:255}).notNull(),
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
  workshopNum:   integer('workshop_num').notNull(),  // 1, 2, or 3
  attended:      boolean('attended').default(false),
  watchedReplay: boolean('watched_replay').default(false),
  xpAwarded:     boolean('xp_awarded').default(false),
  createdAt:     timestamp('created_at').defaultNow(),
})
```

---

## 8. GAMIFICATION SYSTEM

### Badge definitions
```typescript
// lib/gamification/badges.ts
export const BADGES = {
  EXPLORER:      { id: 'explorer',      stage: 1, xp: 50,  color: '#A78BFA', emoji: '🧭', lottie: '/badges/explorer.json',      copy: "Your journey begins. Welcome, Builder!" },
  AI_CURIOUS:    { id: 'ai_curious',    stage: 2, xp: 100, color: '#60A5FA', emoji: '🧠', lottie: '/badges/ai-curious.json',    copy: "You've unlocked the next level. You're shortlisted!" },
  IDEA_LAUNCHER: { id: 'idea_launcher', stage: 2, xp: 75,  color: '#34D399', emoji: '💡', lottie: '/badges/idea-launcher.json', copy: "Your idea is in the universe. Let's make it real." },
  BUILDER:       { id: 'builder',       stage: 3, xp: 200, color: '#FFB800', emoji: '⚡', lottie: '/badges/builder.json',       copy: "You're officially a Super Builder. Let's go!" },
  WARRIOR:       { id: 'warrior',       stage: 4, xp: 150, color: '#FB923C', emoji: '🔥', lottie: '/badges/warrior.json',       copy: "Level up! Workshop 1 complete." },
  DOMAIN_EXPERT: { id: 'domain_expert', stage: 4, xp: 150, color: '#E879F9', emoji: '🎯', lottie: '/badges/domain-expert.json', copy: "You've locked your domain. Now build it." },
  PROTOTYPE_PRO: { id: 'prototype_pro', stage: 4, xp: 200, color: '#818CF8', emoji: '🛠️', lottie: '/badges/prototype-pro.json', copy: "You have a prototype. That's real." },
  HACKER:        { id: 'hacker',        stage: 5, xp: 300, color: '#4ADE80', emoji: '💻', lottie: '/badges/hacker.json',        copy: "You built something. That's huge." },
  SUPER_BUILDER: { id: 'super_builder', stage: 5, xp: 500, color: '#FFD700', emoji: '🏆', lottie: '/badges/super-builder.json', copy: "You did it. You are a Super Builder." },
} as const
export type BadgeId = keyof typeof BADGES
```

### XP trigger table
| Trigger | XP | Badge |
|---------|-----|-------|
| Stage 1 complete | +50 | Explorer |
| Quiz score ≥ 6/10 | +100 | AI Curious |
| Idea submitted | +75 | Idea Launcher |
| Payment confirmed | +200 | Builder |
| Workshop 1 completed | +150 | Workshop Warrior |
| Workshop 2 completed | +150 | Domain Expert |
| Workshop 3 completed | +200 | Prototype Pro |
| Project submitted | +300 | Hacker |
| Certificate issued | +500 | Super Builder |

### Badge unlock animation sequence
```
1. Server action returns { badgeAwarded: BadgeId } after stage complete
2. Zustand stores pending badge
3. BadgeUnlock modal: AnimatePresence overlay
4. Sequence: dark overlay → Lottie animation → canvas-confetti burst →
   badge name + copy text → "Continue" button
5. XPBar animates from old → new via Framer Motion
6. aria-live="polite" announces badge name
7. Total: ~2.5s. Skippable on tap.
```

---

## 9. PROGRAMME CONTENT CONSTANTS

```typescript
// lib/content/programme.ts
export const HACKATHON_START = new Date('2025-06-07T08:00:00+05:30')
export const HACKATHON_END   = new Date('2025-06-08T08:00:00+05:30')
export const REG_DEADLINE    = new Date('2025-05-25T23:59:59+05:30')

export const WORKSHOPS = [
  { id: 1, title: 'AI Fundamentals + Tools Overview',   outcome: 'Use 3+ AI tools confidently', duration: 90, dateRange: 'May 26–Jun 1', badge: 'WARRIOR' as const },
  { id: 2, title: 'Domain Deep-Dive + Problem Framing', outcome: 'Problem statement finalised',  duration: 75, dateRange: 'Jun 1–3',      badge: 'DOMAIN_EXPERT' as const },
  { id: 3, title: 'Build Sprint + Prototype',           outcome: 'Working prototype ready',      duration: 90, dateRange: 'Jun 3–5',      badge: 'PROTOTYPE_PRO' as const },
]

export const PHASES = [
  { num: 1, name: 'Application & Registration', dates: '[DATE]–May 25', milestone: 'Applications close' },
  { num: 2, name: 'Orientation & Onboarding',   dates: 'May 26–Jun 1',  milestone: 'Welcome + Discord' },
  { num: 3, name: 'Workshops ×3',               dates: 'May 26–Jun 5', milestone: '3 workshops' },
  { num: 4, name: 'Build Phase',                dates: 'Jun 1–Jun 6',  milestone: 'Projects built' },
  { num: 5, name: 'Hackathon + Showcase',       dates: 'Jun 7–8',      milestone: '24h hackathon' },
  { num: 6, name: 'Winners + Certificates',     dates: 'Jun 9–10',     milestone: 'Prizes + certs' },
]

export const TIERS = {
  pro: {
    name: 'Pro', priceMin: 1499, priceMax: 1999,
    features: ['3 live workshops', 'Group mentorship', 'Participation certificate', 'Digital badge'],
    missing:  ['1:1 mentor', 'LinkedIn certificate', 'T-shirt + kit', 'Priority judging', 'Parent report', 'EMI'],
  },
  premium: {
    name: 'Premium', priceMin: 2499, priceMax: 2999, emiFirst: 999, popular: true,
    features: ['3 workshops + bonus session', '1:1 mentor (2 slots)', 'Verified LinkedIn certificate',
               'T-shirt + premium kit', 'Priority judging', 'Parent progress report', 'EMI: ₹999 now + rest in 1 week'],
  },
}

export const JUDGING = [
  { criterion: 'Innovation & Originality',      weight: 25, desc: 'Is the idea unique and thoughtful?' },
  { criterion: 'Impact & Problem-Solution Fit', weight: 25, desc: 'Does it solve a real problem?' },
  { criterion: 'Technical Implementation',      weight: 25, desc: 'Does it work? How well is AI used?' },
  { criterion: 'Presentation',                  weight: 15, desc: 'Is the demo video clear and compelling?' },
  { criterion: 'Completeness',                  weight: 10, desc: 'Fully filled and documented?' },
]
```

---

## 10. PAYMENT INTEGRATION (RAZORPAY)

```typescript
// app/api/payments/create-order/route.ts
import Razorpay from 'razorpay'
const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! })

export async function POST(req: Request) {
  const { tier, isEmi }: { tier: 'pro'|'premium', isEmi: boolean } = await req.json()
  const amount = isEmi ? 99900 : tier === 'premium' ? 249900 : 149900  // paise
  const order  = await rzp.orders.create({ amount, currency: 'INR', receipt: `sb_${Date.now()}` })
  return Response.json({ orderId: order.id, amount: order.amount,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID })
}

// app/api/webhooks/razorpay/route.ts
import crypto from 'crypto'
export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('x-razorpay-signature')!
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body).digest('hex')
  if (sig !== expected) return new Response('Unauthorized', { status: 401 })

  const { event } = JSON.parse(body)
  if (event === 'payment.captured') {
    // In a DB transaction:
    // 1. payments: status = 'captured', confirmedAt = now()
    // 2. students: isPaid = true, tier, currentStage = '3'
    // 3. Award Builder badge + 200 XP
    // 4. Generate unique referral code
    // 5. Send confirmation email (Resend) to student + parent
    // 6. Send WhatsApp confirmation (Meta API)
    // 7. Log Discord invite trigger
    // 8. Update referrals table if referredBy exists
  }
  return new Response('OK')
}

// Client checkout (pay/page.tsx — use client):
// Load: <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
// Then: new (window as any).Razorpay({ key: keyId, order_id, ... }).open()
```

---

## 11. REAL-TIME (SSE + UPSTASH REDIS)

```typescript
// app/api/leaderboard/stream/route.ts
import { redis } from '@/lib/redis'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))

      const top50 = await redis.zrange('leaderboard', 0, 49, { rev: true, withScores: true })
      send({ type: 'init', data: top50 })

      const interval = setInterval(async () => {
        const updated = await redis.zrange('leaderboard', 0, 49, { rev: true, withScores: true })
        send({ type: 'update', data: updated })
      }, 10_000)  // poll every 10s

      req.signal.addEventListener('abort', () => { clearInterval(interval); controller.close() })
    }
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' }
  })
}

// Award XP — lib/gamification/xp.ts
export async function awardXP(studentId: string, points: number) {
  await Promise.all([
    redis.zincrby('leaderboard', points, studentId),  // Redis sorted set
    db.update(students).set({ xpPoints: sql`xp_points + ${points}` })
      .where(eq(students.id, studentId)),              // PostgreSQL persistence
  ])
}

// Client hook — hooks/useLeaderboard.ts
export function useLeaderboard() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  useEffect(() => {
    const es = new EventSource('/api/leaderboard/stream')
    es.onmessage = e => { const { type, data } = JSON.parse(e.data); if (type === 'init' || type === 'update') setBoard(data) }
    return () => es.close()
  }, [])
  return board
}
```

---

## 12. PERFORMANCE — 60FPS ON LOW-END ANDROID

Most students are on ₹8,000–₹15,000 Android phones. These rules are non-negotiable.

### Only animate GPU-composited properties
```
SAFE (GPU composited — 60fps):
  transform: translate, scale, rotate, translateZ
  opacity

NEVER animate (causes layout/paint — janky):
  width, height, top, left, right, bottom
  margin, padding, background-color, box-shadow
```

### Device capability detection
```typescript
// hooks/useDeviceCapability.ts
export function useDeviceCapability() {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return { tier: 'high' as const }
    const cores  = navigator.hardwareConcurrency || 4
    const memory = (navigator as any).deviceMemory || 4
    if (cores <= 4 && memory <= 2) return { tier: 'low'  as const }  // Redmi 9A class
    if (cores <= 6 && memory <= 4) return { tier: 'mid'  as const }  // Redmi Note class
    return { tier: 'high' as const }
  }, [])
}

// Apply per tier:
// low:  no Three.js, no particles, CSS transitions only (opacity + transform)
// mid:  Three.js low-poly, reduced particle count
// high: full Three.js, particles, Framer Motion stagger
```

### Three.js optimisation
```typescript
renderer.setPixelRatio(Math.min(devicePixelRatio, tier === 'low' ? 1 : 2))
// Pause animation loop when tab not visible
document.addEventListener('visibilitychange', () => {
  document.hidden ? cancelAnimationFrame(rafId) : animate()
})
```

### Framer Motion — always respect reduced motion
```typescript
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
// Use simple opacity fade if prefersReduced = true
// Never use scale + translate + blur simultaneously — each adds paint cost
```

### Bundle size targets
| Asset | Max (gzipped) |
|-------|--------------|
| Landing page JS | < 90KB |
| Dashboard JS | < 150KB |
| Three.js | lazy-loaded, skip on low tier |
| Lottie badge files | < 40KB each, lazy |
| Total landing page weight | < 1.5MB |

---

## 13. SEO CONFIGURATION

```typescript
// app/(marketing)/page.tsx
export const metadata: Metadata = {
  title: 'Super Builders — AI Hackathon for School Students | zer0.pro',
  description: "India's #1 AI programme for Class 8–12 students. 3-week online programme + 24-hour hackathon. ₹1,00,000+ prizes. Register before May 25.",
  keywords: ['AI hackathon India', 'school hackathon 2025', 'Class 8 12 coding', 'zer0.pro', 'online AI programme teens'],
  openGraph: {
    title: 'Super Builders — Build AI. Win ₹1 Lakh.',
    description: 'Online AI hackathon for Indian school students. Jun 7–8, 2025.',
    images: [{ url: '/og/super-builders.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://superbuilders.zer0.pro' },
}
```

JSON-LD structured data (add as `<script type="application/ld+json">` in the page):
```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Super Builders — School Edition",
  "startDate": "2025-06-07T08:00:00+05:30",
  "endDate": "2025-06-08T08:00:00+05:30",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "organizer": { "@type": "Organization", "name": "zer0.pro", "url": "https://zer0.pro" },
  "offers": { "@type": "Offer", "price": "1499", "priceCurrency": "INR", "validThrough": "2025-05-25" }
}
```

---

## 14. ENVIRONMENT VARIABLES

```bash
# .env.local

# Database — Railway PostgreSQL (auto-injected on Railway deploy)
DATABASE_URL=postgresql://postgres:xxx@monorail.proxy.rlwy.net:PORT/railway

# Auth — Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register/stage-1
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/register/stage-1
CLERK_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...   # public — safe to expose

# Email — Resend
RESEND_API_KEY=re_...
FROM_EMAIL=hello@superbuilders.zer0.pro

# Email — Amazon SES (bulk)
AWS_SES_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# WhatsApp — Meta Cloud API
META_WHATSAPP_TOKEN=...
META_WHATSAPP_PHONE_ID=...
META_WHATSAPP_VERIFY_TOKEN=...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=super-builders-assets
CLOUDFLARE_R2_PUBLIC_URL=https://assets.superbuilders.zer0.pro

# App
NEXT_PUBLIC_APP_URL=https://superbuilders.zer0.pro
NODE_ENV=production
```

---

## 15. AUTH + ROUTE PROTECTION

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isProtected = createRouteMatcher(['/dashboard(.*)', '/register/stage-2(.*)', '/register/stage-3(.*)', '/register/success(.*)', '/admin(.*)'])
export default clerkMiddleware((auth, req) => { if (isProtected(req)) auth().protect() })
export const config = { matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'] }
```

Stage-gate enforcement (in each stage layout, server-side):
```typescript
// Verify student has completed previous stage before rendering current
const [student] = await db.select().from(students).where(eq(students.clerkId, userId!))
if (!student || parseInt(student.currentStage) < requiredStage) redirect('/register/stage-X')
```

---

## 16. LANDING PAGE SECTION ORDER

Build in this exact order — optimised for conversion:

1. Sticky `<Navbar />` — zer0.pro logo + live countdown pill + "Register Now" CTA
2. `<HeroSection />` — full viewport, void black, grid overlay, Three.js badge, prize + deadline countdown, dual CTA
3. `<StatsBar />` — live student count, cities, prize pool (ISR)
4. `<ProgrammePitch />` — 3 pillars: Learn AI → Build → Win + Get Certified
5. `<ProgrammeTimeline />` — 6 phases visual, horizontal scroll on mobile
6. `<WorkshopCards />` — WS1, WS2, WS3 with badge previews
7. `<TierComparison />` — Pro vs Premium, "Most Popular" on Premium
8. `<BadgeWall />` — all 9 badges animated preview (teen excitement)
9. `<DomainGrid />` — Health, Education, Finance, Environment, Entertainment, Social Impact
10. `<ForParents />` — safety + credentials + outcomes + refund + webinar CTA
11. `<JudgingCriteria />` — visual 5-criterion breakdown
12. `<FAQ />` — min 12 questions, accordion
13. `<FinalCTA />` — full-width gold on black, countdown, "Register before May 25"
14. Mobile sticky bottom bar — always-visible CTA on scroll

---

## 17. COPY PRINCIPLES

Student-facing (teens 13–18):
1. Second-person present: "You're building the future" ✅ / "Students will learn..." ❌
2. Celebrate every micro-win: animated confirm on every form submit
3. Progress framing: "Step 2 of 5 — almost in!" ✅ / "Application in progress" ❌
4. Action CTAs: "Claim your spot" / "Level up" / "Launch your idea" ✅ / "Submit" / "Next" ❌
5. Friendly scarcity: "Only X spots left in your grade" — not anxiety-inducing
6. Emoji set: 🚀 🧠 🔥 💡 🏆 — consistent, never random
7. No unexplained jargon: "Prompt engineering (how you talk to AI)"

Parent-facing:
1. Safety first — "Online only, recorded, verified mentors"
2. Credential framing — "zer0.pro certified, LinkedIn shareable"
3. Outcome proof — "90% build a working AI prototype"
4. Reassure on price — refund policy, EMI, what they're getting
5. Community — dedicated WhatsApp group for parents

---

## 18. DROP-OFF RECOVERY TRIGGERS

Implement as Railway cron jobs or Upstash QStash:

| Condition | Delay | Action |
|-----------|-------|--------|
| Stage 1 started, not submitted | 48h | WA + Email to student |
| Quiz unlocked, not started | 24h | WA + Email to student |
| Shortlisted, not paid | D+1 | Email student + parent separately |
| Shortlisted, not paid | D+2 | WA scarcity ("X spots left in [City]") |
| Shortlisted, not paid | D+3 | Email social proof (testimonial) |
| Shortlisted, not paid | D+4 | Sales team flag for manual call |
| Shortlisted, not paid | D+5 | Urgency email + WA ("spot expires 48h") |
| Shortlisted, not paid | Final | "Last chance — May 25" WA |

---

## 19. RAILWAY DEPLOYMENT

```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm db:migrate && pnpm build"

[deploy]
startCommand = "pnpm start"
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 3
```

```json
// package.json — key scripts
{
  "dev":          "next dev",
  "build":        "next build",
  "start":        "next start -p $PORT",
  "db:generate":  "drizzle-kit generate",
  "db:migrate":   "drizzle-kit migrate",
  "db:studio":    "drizzle-kit studio",
  "type-check":   "tsc --noEmit"
}
```

Railway auto-provides: `DATABASE_URL`, `PORT`, `RAILWAY_ENVIRONMENT`.

---

## 20. CERTIFICATE GENERATION

Use the `canvas-design` skill. Available fonts in `/mnt/skills/examples/canvas-design/canvas-fonts/`:
- `JetBrainsMono-Regular.ttf` / `JetBrainsMono-Bold.ttf` — for certificate ID and labels
- `BigShoulders-Bold.ttf` — large display text alternative to Bebas Neue

Certificate spec:
- 1920×1080px PNG + PDF version
- Black background (#000)
- Gold border + zer0.pro logo top-left
- Student name: ~64px display font in #FFB800 (centre)
- "Super Builder — School Edition, Season 1" in Exo 2
- Programme date range
- Project title (if submitted)
- Unique certificate ID bottom-right (JetBrains Mono)
- QR code linking to `/verify/[certificateId]`
- Upload to Cloudflare R2, update `students.certificate_url`

---

## 21. SECURITY CHECKLIST

- [ ] All DB queries in Server Components / Route Handlers — zero client-side DB calls
- [ ] Razorpay webhook: HMAC SHA256 signature verify on every request, reject if invalid
- [ ] Clerk middleware: all `/dashboard/*`, `/register/stage-2+/*`, `/admin/*` protected
- [ ] Rate limiting: quiz max 2 attempts per student (Upstash Redis counter)
- [ ] Rate limiting: payment endpoint max 3 attempts/hour per student
- [ ] All inputs validated with Zod before DB insert
- [ ] Parental consent: stored with timestamp for all students (all are under 18)
- [ ] `DATABASE_URL`, `CLERK_SECRET_KEY`, `RAZORPAY_KEY_SECRET` — never in `NEXT_PUBLIC_*`
- [ ] R2 bucket: not publicly listable, signed URL access only

---

## 22. SKILLS REFERENCE FOR CLAUDE CODE

### `frontend-design` — `/mnt/skills/public/frontend-design/SKILL.md`
**Always invoke when** building any UI component, page section, dashboard widget, or visual layout.
Read this skill before starting any frontend build task. It provides guidance on aesthetic direction, typography choices, motion, and production-grade code quality. Super Builders visual identity: dark theme + #FFB800 gold, mobile-first 375px, no generic AI aesthetics.

### `canvas-design` — `/mnt/skills/examples/canvas-design/SKILL.md`
**Invoke when** generating certificates, OG images, badge PNGs, or any node-canvas / image output task.
Fonts available in `/mnt/skills/examples/canvas-design/canvas-fonts/`:
- `JetBrainsMono-Regular.ttf`, `JetBrainsMono-Bold.ttf` — matches project mono stack
- `BigShoulders-Bold.ttf` — bold display alternative for certificates

### Skills NOT applicable to this project
- `brand-guidelines` — this is Anthropic's brand (Poppins + Lora + orange/blue). Do not use for Super Builders. Super Builders uses zer0.pro brand (#FFB800 gold + black + Bebas Neue + Exo 2).
- `theme-factory` — for PPTX slide deck styling, not Next.js web development.

---

## 23. DEVELOPMENT CHECKLIST

**Phase 1 — Foundation**
- [ ] Next.js 15 + TypeScript + Tailwind 4 init
- [ ] shadcn/ui + design tokens in globals.css
- [ ] next/font for all 4 typefaces (no CLS)
- [ ] Drizzle schema + Railway PostgreSQL connection
- [ ] Run migrations, verify connection
- [ ] Clerk setup + middleware
- [ ] App shell: Navbar, Footer

**Phase 2 — Landing Page**
- [ ] HeroSection (Three.js badge, countdown, CTA)
- [ ] StatsBar (ISR)
- [ ] ProgrammeTimeline
- [ ] TierComparison
- [ ] BadgeWall (teen section)
- [ ] ForParents
- [ ] FAQ
- [ ] SEO metadata + JSON-LD + OG image

**Phase 3 — Registration Pipeline**
- [ ] Stage 1: Application + parent consent
- [ ] Stage 2A: AI quiz
- [ ] Stage 2B: Idea submission
- [ ] Stage 3: Pre-payment questions + tier select
- [ ] Stage 3: Razorpay checkout
- [ ] Razorpay webhook + onboarding unlock
- [ ] Success page + Builder badge animation

**Phase 4 — Student Dashboard**
- [ ] Dashboard shell + mobile nav
- [ ] XP bar + badge display
- [ ] Workshop schedule + recordings
- [ ] Leaderboard (SSE)
- [ ] Project submission form
- [ ] Certificate download

**Phase 5 — Automation + Admin**
- [ ] Email templates (Resend)
- [ ] WhatsApp automation
- [ ] Drop-off cron jobs
- [ ] Admin: students table + judging interface
- [ ] Certificate generation (canvas-design skill)

---

*Super Builders × zer0.pro · CLAUDE.md v2.0 · Railway + PostgreSQL · Teen-first Design · Season 1 · 2025*