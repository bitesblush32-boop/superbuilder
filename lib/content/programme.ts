export const HACKATHON_START = new Date('2026-06-07T08:00:00+05:30')
export const HACKATHON_END = new Date('2026-06-08T08:00:00+05:30')
export const REG_DEADLINE = new Date('2026-05-25T23:59:59+05:30')

export const WORKSHOPS = [
  {
    id: 1,
    title: 'AI Fundamentals + Tools Overview',
    outcome: 'Use 3+ AI tools confidently',
    duration: 90,
    dateRange: 'May 26–Jun 1',
    badge: 'WARRIOR' as const,
  },
  {
    id: 2,
    title: 'Domain Deep-Dive + Problem Framing',
    outcome: 'Problem statement finalised',
    duration: 75,
    dateRange: 'Jun 1–3',
    badge: 'DOMAIN_EXPERT' as const,
  },
  {
    id: 3,
    title: 'Build Sprint + Prototype',
    outcome: 'Working prototype ready',
    duration: 90,
    dateRange: 'Jun 3–5',
    badge: 'PROTOTYPE_PRO' as const,
  },
] as const

export const PHASES = [
  { num: 1, name: 'Application & Registration', dates: '[DATE]–May 25', milestone: 'Applications close' },
  { num: 2, name: 'Orientation & Onboarding', dates: 'May 26–Jun 1', milestone: 'Welcome + Discord' },
  { num: 3, name: 'Workshops ×3', dates: 'May 26–Jun 5', milestone: '3 workshops' },
  { num: 4, name: 'Build Phase', dates: 'Jun 1–Jun 6', milestone: 'Projects built' },
  { num: 5, name: 'Hackathon + Showcase', dates: 'Jun 7–8', milestone: '24h hackathon' },
  { num: 6, name: 'Winners + Certificates', dates: 'Jun 9–10', milestone: 'Prizes + certs' },
] as const

export const TIERS = {
  pro: {
    name: 'Pro',
    priceMin: 1499,
    priceMax: 1999,
    features: [
      '3 live workshops',
      'Group mentorship',
      'Participation certificate',
      'Digital badge',
    ],
    missing: [
      '1:1 mentor',
      'LinkedIn certificate',
      'T-shirt + kit',
      'Priority judging',
      'Parent report',
      'EMI',
    ],
  },
  premium: {
    name: 'Premium',
    priceMin: 2499,
    priceMax: 2999,
    emiFirst: 999,
    popular: true,
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
} as const

export const JUDGING = [
  { criterion: 'Innovation & Originality', weight: 25, desc: 'Is the idea unique and thoughtful?' },
  { criterion: 'Impact & Problem-Solution Fit', weight: 25, desc: 'Does it solve a real problem?' },
  { criterion: 'Technical Implementation', weight: 25, desc: 'Does it work? How well is AI used?' },
  { criterion: 'Presentation', weight: 15, desc: 'Is the demo video clear and compelling?' },
  { criterion: 'Completeness', weight: 10, desc: 'Fully filled and documented?' },
] as const
