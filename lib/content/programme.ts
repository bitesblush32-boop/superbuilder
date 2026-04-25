export const HACKATHON_START = new Date('2026-06-07T08:00:00+05:30')
export const HACKATHON_END   = new Date('2026-06-08T08:00:00+05:30')
export const REG_DEADLINE    = new Date('2026-05-30T23:59:59+05:30')
export const DEMO_DAY        = new Date('2026-06-27T10:00:00+05:30')
export const CERTS_LIVE      = new Date('2026-07-01T00:00:00+05:30')

export const WORKSHOPS = [
  {
    id: 1,
    title: 'AI Fundamentals + Tools Overview',
    outcome: 'Use 3+ AI tools confidently',
    duration: 90,
    dateRange: 'Jun 3',
    badge: 'WARRIOR' as const,
  },
  {
    id: 2,
    title: 'Domain Deep-Dive + Problem Framing',
    outcome: 'Problem statement finalised',
    duration: 75,
    dateRange: 'Jun 4',
    badge: 'DOMAIN_EXPERT' as const,
  },
  {
    id: 3,
    title: 'Build Sprint + Prototype',
    outcome: 'Working prototype ready',
    duration: 90,
    dateRange: 'Jun 5',
    badge: 'PROTOTYPE_PRO' as const,
  },
] as const

export const PHASES = [
  { num: 1, name: 'Application & Registration', dates: 'Now–May 30', milestone: 'Applications close' },
  { num: 2, name: 'Orientation & Workshops', dates: 'Jun 3–5', milestone: '3 workshops' },
  { num: 3, name: 'Build Phase', dates: 'Jun 5–Jun 6', milestone: 'Projects built' },
  { num: 4, name: 'Hackathon + Showcase', dates: 'Jun 7–8', milestone: '24h hackathon' },
  { num: 5, name: 'Demo Day + Certificates', dates: 'Jun 27 / Jul 1', milestone: 'Prizes + certs' },
] as const


export const JUDGING = [
  { criterion: 'Innovation & Originality', weight: 25, desc: 'Is the idea unique and thoughtful?' },
  { criterion: 'Impact & Problem-Solution Fit', weight: 25, desc: 'Does it solve a real problem?' },
  { criterion: 'Technical Implementation', weight: 25, desc: 'Does it work? How well is AI used?' },
  { criterion: 'Presentation', weight: 15, desc: 'Is the demo video clear and compelling?' },
  { criterion: 'Completeness', weight: 10, desc: 'Fully filled and documented?' },
] as const
