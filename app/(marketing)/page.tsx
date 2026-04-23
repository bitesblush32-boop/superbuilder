import type { Metadata } from 'next'
import Script from 'next/script'
import { getDatesConfig } from '@/lib/db/queries/config'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MobileStickyBar } from '@/components/layout/MobileStickyBar'
import { HeroSection } from './_components/HeroSection'
import { StatsBar } from './_components/StatsBar'
import { ProgrammeTimeline } from './_components/ProgrammeTimeline'
import { TierComparison } from './_components/TierComparison'
import { BadgeWall } from './_components/BadgeWall'
import { DomainGrid } from './_components/DomainGrid'
import { ForParents } from './_components/ForParents'
import { JudgingCriteria } from './_components/JudgingCriteria'
import { FAQ } from './_components/FAQ'
import { JurySection } from './_components/JurySection'
import { FinalCTA } from './_components/FinalCTA'

/* ─── ISR — revalidate once per minute ──────────────────────────────────────── */
export const revalidate = 60

/* ─── SEO Metadata ───────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Super Builders — AI Hackathon for School Students | zer0.pro',
  description:
    "India's #1 AI programme for Class 8–12 students. 3-week online programme + 24-hour hackathon. ₹1,00,000+ prizes. Register before May 25.",
  keywords: [
    'AI hackathon India',
    'school hackathon 2026',
    'Class 8 12 coding',
    'zer0.pro',
    'online AI programme teens',
  ],
  openGraph: {
    title: 'Super Builders — Build AI. Win ₹1 Lakh.',
    description:
      'Online AI hackathon for Indian school students. Jun 7–8, 2026.',
    images: [{ url: '/og/super-builders.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  metadataBase: new URL('https://superbuilder.org'),
  alternates: { canonical: 'https://superbuilder.org' },
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default async function LandingPage() {
  const dates = await getDatesConfig()

  const hackDate = new Date(dates.hackathonStartISO)
  const hackathonStartDisplay = hackDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Super Builders — School Edition',
    startDate: dates.hackathonStartISO,
    endDate: dates.hackathonEndISO,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    organizer: {
      '@type': 'Organization',
      name: 'zer0.pro',
      url: 'https://zer0.pro',
    },
    offers: {
      '@type': 'Offer',
      price: '2999',
      priceCurrency: 'INR',
      validThrough: dates.regDeadlineISO,
    },
  }

  return (
    <>
      {/* JSON-LD */}
      <Script
        id="landing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1 — Sticky nav */}
      <Navbar
        regDeadlineISO={dates.regDeadlineISO}
        regDeadlineDisplay={dates.regDeadlineDisplay}
      />

      <main className="pb-20 md:pb-0">
        {/* 2 — Hero */}
        <HeroSection
          hackathonStartISO={dates.hackathonStartISO}
          regDeadlineISO={dates.regDeadlineISO}
        />

        {/* 3 — Stats bar */}
        <StatsBar />

        {/* 4 — Programme timeline (phases + workshop cards) */}
        <ProgrammeTimeline phases={dates.phases} workshops={dates.workshops} />

        {/* 5 — Pricing (solo vs team) */}
        <TierComparison />

        {/* 6 — Badge wall */}
        <BadgeWall />

        {/* 7 — Domain grid */}
        <DomainGrid />

        {/* 8 — For parents */}
        <ForParents />

        {/* 9 — Judging criteria */}
        <JudgingCriteria />

        {/* 10 — FAQ */}
        <FAQ />

        {/* 11 — Final CTA */}
        <FinalCTA regDeadlineISO={dates.regDeadlineISO} regDeadlineDisplay={dates.regDeadlineDisplay} />
      </main>

      {/* 12 — Footer */}
      <Footer />

      {/* 13 — Mobile sticky bar (client component, portal-like) */}
      <MobileStickyBar />
    </>
  )
}
