'use client'

import Image from 'next/image'

const JURY = [
  {
    name: 'Arjun Mehta',
    role: 'AI Research Lead',
    org: 'Google DeepMind India',
    expertise: ['Machine Learning', 'NLP', 'Education Tech'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=ArjunMehta&backgroundColor=1a1a1a',
    linkedin: '#',
  },
  {
    name: 'Priya Nair',
    role: 'Founder & CTO',
    org: 'EduAI Ventures',
    expertise: ['EdTech', 'Product', 'Startups'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=PriyaNair&backgroundColor=1a1a1a',
    linkedin: '#',
  },
  {
    name: 'Rohan Sharma',
    role: 'Senior Engineer',
    org: 'Microsoft Azure',
    expertise: ['Cloud', 'AI Infra', 'Open Source'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=RohanSharma&backgroundColor=1a1a1a',
    linkedin: '#',
  },
  {
    name: 'Kavya Reddy',
    role: 'Product Director',
    org: 'Flipkart AI',
    expertise: ['GenAI', 'Commerce', 'UX Research'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=KavyaReddy&backgroundColor=1a1a1a',
    linkedin: '#',
  },
  {
    name: 'Siddharth Rao',
    role: 'VC Partner',
    org: 'Blume Ventures',
    expertise: ['DeepTech', 'B2B SaaS', 'Impact'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=SiddharthRao&backgroundColor=1a1a1a',
    linkedin: '#',
  },
  {
    name: 'Ananya Iyer',
    role: 'Head of Innovation',
    org: 'NASSCOM Foundation',
    expertise: ['Social Impact', 'Digital India', 'AI Ethics'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=AnanyaIyer&backgroundColor=1a1a1a',
    linkedin: '#',
  },
]

export function JurySection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* top fade from FAQ section */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to bottom, var(--bg-base), transparent)' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🏆</span>
            <span
              className="text-xs font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
              style={{
                color: 'var(--text-brand)',
                borderColor: 'var(--border-brand)',
                background: 'var(--brand-subtle)',
              }}
            >
              Verified Jury
            </span>
          </div>
          <h2
            className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide leading-none"
            style={{ color: 'var(--text-1)' }}
          >
            MEET THE JUDGES
          </h2>
          <p className="mt-3 text-sm md:text-base max-w-xl" style={{ color: 'var(--text-3)' }}>
            Industry leaders &amp; builders who will evaluate your projects across Innovation, Impact, and Execution.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {JURY.map((judge) => (
            <JuryCard key={judge.name} judge={judge} />
          ))}
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-xs text-center" style={{ color: 'var(--text-4)' }}>
          * Placeholder jury — final jury details will be announced closer to the event.
        </p>
      </div>
    </section>
  )
}

function JuryCard({ judge }: { judge: (typeof JURY)[number] }) {
  return (
    <div
      className="group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* brand glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1px var(--border-brand)' }}
      />

      {/* Avatar strip */}
      <div
        className="relative h-40 flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--bg-raised)' }}
      >
        {/* decorative radial glow behind avatar */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at 50% 70%, var(--brand-glow) 0%, transparent 70%)',
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={judge.avatar}
          alt={judge.name}
          width={96}
          height={96}
          className="relative z-10 w-24 h-24 rounded-full border-2 object-cover"
          style={{ borderColor: 'var(--border-brand)' }}
        />

        {/* LinkedIn badge */}
        <a
          href={judge.linkedin}
          aria-label={`${judge.name} on LinkedIn`}
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center border transition-colors duration-200"
          style={{
            background: 'var(--bg-float)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-3)',
          }}
          onClick={(e) => e.preventDefault()}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-bold text-base leading-tight" style={{ color: 'var(--text-1)' }}>
          {judge.name}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-brand)' }}>
          {judge.role}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
          {judge.org}
        </p>

        {/* expertise tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {judge.expertise.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              style={{
                color: 'var(--text-3)',
                borderColor: 'var(--border-faint)',
                background: 'var(--bg-float)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
