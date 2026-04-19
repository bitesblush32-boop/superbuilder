import { db } from '@/lib/db'
import { programmeConfig, scheduleItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PhaseEntry = {
  num:       number
  name:      string
  dates:     string
  milestone: string
}

export type WorkshopEntry = {
  id:        number
  title:     string
  outcome:   string
  duration:  number
  dateRange: string
  badge:     string
}

export type DatesConfig = {
  regDeadlineISO:     string
  regDeadlineDisplay: string
  hackathonStartISO:  string
  hackathonEndISO:    string
  resultsDisplay:     string
  phases:             PhaseEntry[]
  workshops:          WorkshopEntry[]
}

export type PricingConfig = {
  pro: {
    priceMin: number
    priceMax: number
    features: string[]
    missing:  string[]
  }
  premium: {
    priceMin: number
    priceMax: number
    emiFirst: number
    features: string[]
  }
}

export type ScheduleItem = {
  id:            string
  type:          string
  title:         string
  description:   string | null
  url:           string | null
  targetStage:   string | null
  targetSection: string | null
  scheduledAt:   Date | null
  durationMins:  number | null
  isVisible:     boolean
  notifySent:    boolean
  createdAt:     Date
}

// ─── Defaults (fallback to programme.ts values) ───────────────────────────────

export const DEFAULT_DATES: DatesConfig = {
  regDeadlineISO:     '2025-05-25T23:59:59+05:30',
  regDeadlineDisplay: 'May 25',
  hackathonStartISO:  '2025-06-07T08:00:00+05:30',
  hackathonEndISO:    '2025-06-08T08:00:00+05:30',
  resultsDisplay:     'Jun 9–10',
  phases: [
    { num: 1, name: 'Application & Registration', dates: '[DATE]–May 25', milestone: 'Applications close' },
    { num: 2, name: 'Orientation & Onboarding',   dates: 'May 26–Jun 1',  milestone: 'Welcome + Discord' },
    { num: 3, name: 'Workshops ×3',               dates: 'May 26–Jun 5', milestone: '3 workshops' },
    { num: 4, name: 'Build Phase',                dates: 'Jun 1–Jun 6',  milestone: 'Projects built' },
    { num: 5, name: 'Hackathon + Showcase',       dates: 'Jun 7–8',      milestone: '24h hackathon' },
    { num: 6, name: 'Winners + Certificates',     dates: 'Jun 9–10',     milestone: 'Prizes + certs' },
  ],
  workshops: [
    { id: 1, title: 'AI Fundamentals + Tools Overview',   outcome: 'Use 3+ AI tools confidently', duration: 90, dateRange: 'May 26, 6PM IST · 90 mins', badge: 'WARRIOR'      },
    { id: 2, title: 'Domain Deep-Dive + Problem Framing', outcome: 'Problem statement finalised',  duration: 75, dateRange: 'Jun 1–3',                   badge: 'DOMAIN_EXPERT' },
    { id: 3, title: 'Build Sprint + Prototype',           outcome: 'Working prototype ready',      duration: 90, dateRange: 'Jun 3–5',                   badge: 'PROTOTYPE_PRO' },
  ],
}

export const DEFAULT_PRICING: PricingConfig = {
  pro: {
    priceMin: 1499,
    priceMax: 1999,
    features: ['3 live workshops', 'Group mentorship', 'Participation certificate', 'Digital badge'],
    missing:  ['1:1 mentor', 'LinkedIn certificate', 'T-shirt + kit', 'Priority judging', 'Parent report', 'EMI'],
  },
  premium: {
    priceMin: 2499,
    priceMax: 2999,
    emiFirst: 999,
    features: [
      '3 workshops + bonus session',
      '1:1 mentor (2 slots)',
      'Verified LinkedIn certificate',
      'T-shirt + premium kit',
      'Priority judging',
      'Parent progress report',
      'EMI: ₹999 now + rest in 1 week',
    ],
  },
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export async function getDatesConfig(): Promise<DatesConfig> {
  try {
    const [row] = await db.select().from(programmeConfig).where(eq(programmeConfig.section, 'dates')).limit(1)
    return row ? (row.data as DatesConfig) : DEFAULT_DATES
  } catch {
    return DEFAULT_DATES
  }
}

export async function getPricingConfig(): Promise<PricingConfig> {
  try {
    const [row] = await db.select().from(programmeConfig).where(eq(programmeConfig.section, 'pricing')).limit(1)
    return row ? (row.data as PricingConfig) : DEFAULT_PRICING
  } catch {
    return DEFAULT_PRICING
  }
}

export async function getScheduleItems(targetStage?: string): Promise<ScheduleItem[]> {
  try {
    const rows = await db
      .select()
      .from(scheduleItems)
      .orderBy(asc(scheduleItems.scheduledAt), asc(scheduleItems.createdAt))
    const items = rows.map(r => ({
      id:            r.id,
      type:          r.type,
      title:         r.title,
      description:   r.description,
      url:           r.url,
      targetStage:   r.targetStage,
      targetSection: r.targetSection,
      scheduledAt:   r.scheduledAt,
      durationMins:  r.durationMins,
      isVisible:     r.isVisible,
      notifySent:    r.notifySent,
      createdAt:     r.createdAt,
    }))
    if (targetStage) {
      return items.filter(i => i.isVisible && (i.targetStage === targetStage || i.targetStage === 'all'))
    }
    return items
  } catch {
    return []
  }
}

// ─── Setters ──────────────────────────────────────────────────────────────────

export async function upsertDatesConfig(data: DatesConfig): Promise<void> {
  await db
    .insert(programmeConfig)
    .values({ section: 'dates', data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: programmeConfig.section, set: { data, updatedAt: new Date() } })
}

export async function upsertPricingConfig(data: PricingConfig): Promise<void> {
  await db
    .insert(programmeConfig)
    .values({ section: 'pricing', data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: programmeConfig.section, set: { data, updatedAt: new Date() } })
}
