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
  metadataBase: new URL('https://www.superbuilder.org'),
  alternates: { canonical: 'https://www.superbuilder.org' },

  title: {
    default: 'Super Builders — AI Hackathon for School Students in India | zer0.pro',
    template: '%s | Super Builders',
  },
  description:
    "India's #1 AI hackathon for school students (Class 8–12) from Bangalore, Mumbai, Delhi, Hyderabad & across India. Online programme + 24-hour build sprint. ₹1,00,000+ prize pool. Register before May 30, 2026.",

  keywords: [
    // Brand
    'Super Builders',
    'superbuilders',
    'superbuilder hackathon',
    'Super Builders hackathon 2026',
    'zer0.pro',
    'superbuilder.org',
    // Primary — generic
    'hackathon',
    'AI hackathon',
    'hackathon 2026',
    'hackathon India',
    'AI hackathon India',
    'AI hackathon India 2026',
    // School / students
    'hackathon for school students',
    'hackathon for school students India',
    'hackathon for students India',
    'online hackathon Class 8 9 10 11 12',
    'coding competition for school students India',
    'AI competition for students 2026',
    'hackathon for 13 14 15 16 17 18 year olds India',
    'school coding hackathon online 2026',
    'AI programme for school students',
    'summer hackathon students 2026',
    'student hackathon India 2026',
    // Bangalore / city specific
    'hackathon in Bangalore',
    'hackathon in Bangalore 2026',
    'AI hackathon in Bangalore',
    'AI hackathon Bangalore 2026',
    'hackathon for school students Bangalore',
    'coding competition Bangalore school students',
    'student hackathon Bangalore',
    'hackathon in Mumbai',
    'hackathon in Delhi',
    'hackathon in Hyderabad',
    'hackathon in Chennai',
    'hackathon in Pune',
    'hackathon in Kolkata',
    'online hackathon India cities',
    // Parent queries
    'safe online hackathon for kids India',
    'coding programme Class 10 11 12 India',
    'AI internship school students India',
    'online AI programme teens India',
    'build AI project win prize India',
  ],

  openGraph: {
    type: 'website',
    siteName: 'Super Builders by zer0.pro',
    title: 'Super Builders — AI Hackathon for School Students | Win ₹1 Lakh',
    description: "India's #1 AI hackathon for school students from Bangalore, Mumbai, Delhi & across India. ₹1,00,000+ prizes. Jun 7–8, 2026.",
    url: 'https://www.superbuilder.org',
    images: [{
      url: 'https://www.superbuilder.org/og/super-builders.jpg',
      width: 1200,
      height: 630,
      alt: 'Super Builders — AI Hackathon for Indian School Students 2026',
    }],
    locale: 'en_IN',
  },

  twitter: {
    card: 'summary_large_image',
    site: '@zer0pro',
    title: 'Super Builders — AI Hackathon for School Students in India',
    description: "India's #1 AI hackathon. Class 8–12. Students from Bangalore, Mumbai, Delhi & all cities. ₹1L+ prizes. Jun 7–8, 2026.",
    images: ['https://www.superbuilder.org/og/super-builders.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Geo targeting — India
  other: {
    'geo.region': 'IN',
    'geo.country': 'India',
    'geo.placename': 'India',
    'DC.language': 'en-IN',
    'application-name': 'Super Builders',
    // ⚠️ Replace these with real tokens from Google Search Console and Bing Webmaster Tools
    'google-site-verification': 'google-site-verification=O2Flp4DTUco40Sih8OFiKAEdQlbpjQM-V_Aok_f5C-8',
    'msvalidate.01': 'REPLACE_WITH_BING_TOKEN',
  },
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default async function LandingPage() {
  const dates = await getDatesConfig()

  const hackDate = new Date(dates.hackathonStartISO)
  const hackathonStartDisplay = hackDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  // ── JSON-LD: Event ─────────────────────────────────────────────────────────
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Super Builders — AI Hackathon for School Students',
    description: "India's biggest online AI hackathon for Class 8–12 students. 3-week programme + 24-hour build sprint. ₹1,00,000+ prize pool.",
    startDate: dates.hackathonStartISO,
    endDate: dates.hackathonEndISO,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://www.superbuilder.org',
    },
    image: 'https://www.superbuilder.org/og/super-builders.jpg',
    organizer: {
      '@type': 'Organization',
      name: 'zer0.pro',
      url: 'https://zer0.pro',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Solo Registration',
        price: '3499',
        priceCurrency: 'INR',
        validThrough: dates.regDeadlineISO,
        url: 'https://www.superbuilder.org/dashboard/apply',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Team Registration (per head)',
        price: '2999',
        priceCurrency: 'INR',
        validThrough: dates.regDeadlineISO,
        url: 'https://www.superbuilder.org/dashboard/apply',
        availability: 'https://schema.org/InStock',
      },
    ],
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
    },
  }

  // ── JSON-LD: EducationalOccupationalProgram ────────────────────────────────
  // Helps rank for "AI course for school students", "AI programme India" etc.
  const eduJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: 'Super Builders — AI Hackathon Programme for School Students',
    description: "India's #1 AI learning programme and hackathon for school students (Class 8–12). 3 weeks of live AI workshops followed by a 24-hour national hackathon. Open to students from Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune, Kolkata and all cities across India.",
    url: 'https://www.superbuilder.org',
    provider: {
      '@type': 'Organization',
      name: 'zer0.pro',
      url: 'https://zer0.pro',
    },
    educationalProgramMode: 'online',
    timeToComplete: 'P3W',
    startDate: dates.hackathonStartISO.split('T')[0],
    occupationalCategory: 'Artificial Intelligence, Software Development',
    applicationStartDate: new Date().toISOString().split('T')[0],
    applicationDeadline: dates.regDeadlineISO.split('T')[0],
    offers: {
      '@type': 'Offer',
      price: '3499',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validThrough: dates.regDeadlineISO,
    },
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType: 'School students Class 8–12, age 13–18, India',
    },
    teaches: [
      'Artificial Intelligence fundamentals',
      'Prompt engineering',
      'AI product building',
      'Problem framing',
      'Prototype development',
    ],
    inLanguage: 'en-IN',
    location: {
      '@type': 'VirtualLocation',
      url: 'https://www.superbuilder.org',
    },
  }

  // ── JSON-LD: Organization ──────────────────────────────────────────────────
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'zer0.pro',
    url: 'https://zer0.pro',
    logo: 'https://www.superbuilder.org/logo.png',
    sameAs: [
      'https://www.instagram.com/superbuilder2k26?utm_source=qr&igsh=bXV2ajRubXFhNmV5',
      'https://linkedin.com/company/zer0pro',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@superbuilder.org',
    },
  }

  // ── JSON-LD: FAQ ───────────────────────────────────────────────────────────
  // Google displays FAQ accordions directly in search results — massive CTR boost
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who can participate in Super Builders?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Any school student in Class 8 to 12 (age 13–18) studying in India can participate. The programme is 100% online so students from any city or town can join.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the registration fee?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Solo registration is ₹3,499. Teams of 2–3 pay ₹2,999 per head — saving ₹500 each. This is a one-time fee with no hidden charges.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need to know coding to participate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No prior coding experience is required. Super Builders is designed for beginners and intermediate students alike. You will learn how to use AI tools to build projects during the 3-week programme.',
        },
      },
      {
        '@type': 'Question',
        name: 'When is the hackathon?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 24-hour hackathon runs from June 7, 2026 (8 AM IST) to June 8, 2026 (8 AM IST). The 3-week learning programme runs from May 26 to June 5.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the prizes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The prize pool is over ₹1,00,000. Winners receive cash prizes, verified blockchain credentials, LinkedIn certificates, and fast-track access to tech internships via the Super Interns platform.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a refund policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Full refunds are available before May 25, 2026. After that date, a partial refund of 50% applies up until June 1. No refunds after June 1.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can students from tier-2 and tier-3 cities participate?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely. Super Builders is 100% online. Students from any city, town, or village in India can participate using any smartphone or computer with an internet connection.',
        },
      },
      {
        '@type': 'Question',
        name: 'What do participants get?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'All participants get: 3 live AI workshops, group mentorship sessions, 24-hour hackathon access, a participation certificate with digital badge, access to the ₹1,00,000+ prize pool, XP leaderboard, and Discord community. Solo participants also receive an on-chain credential, Super Interns fast-pass, and a personalised letter of recommendation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Super Builders available for students in Bangalore?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Super Builders is fully online and open to school students (Class 8–12) from Bangalore, Bengaluru, and all cities across India. Students from Bangalore have already signed up and will compete on the same national leaderboard. You only need a smartphone or laptop with internet — no travel required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there an AI hackathon for school students in Bangalore in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Super Builders is the leading online AI hackathon for school students in India in 2026, open to all students in Bangalore and across the country. The hackathon runs June 7–8, 2026 (24 hours, fully online). Students from Bangalore can participate from home. Register at superbuilder.org before May 30, 2026.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Super Builders?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Super Builders (superbuilder.org) is India\'s biggest online AI hackathon and learning programme for school students in Class 8–12. Organised by zer0.pro, it is a 3-week programme followed by a 24-hour hackathon on June 7–8, 2026. Students learn to build AI-powered products, compete for a ₹1,00,000+ prize pool, and earn verified certificates. Students from Bangalore, Mumbai, Delhi, Hyderabad, Chennai, Pune, and all cities across India participate.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Super Builders different from other hackathons?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Super Builders is built specifically for school students with zero prior coding experience. Unlike college hackathons, it includes 3 weeks of structured AI workshops before the build sprint. Students earn XP, unlock badges, and build real AI projects they can show on their LinkedIn and college applications. It is 100% online, accessible from any city in India, with a ₹1,00,000+ prize pool.',
        },
      },
    ],
  }

  return (
    <>
      {/* JSON-LD — Educational Programme */}
      <Script
        id="jsonld-edu"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eduJsonLd) }}
      />
      {/* JSON-LD — Event */}
      <Script
        id="jsonld-event"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* JSON-LD — Organization */}
      <Script
        id="jsonld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* JSON-LD — FAQ (renders accordion rich results in Google) */}
      <Script
        id="jsonld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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
