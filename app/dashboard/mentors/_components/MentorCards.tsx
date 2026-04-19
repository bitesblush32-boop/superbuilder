'use client'

import { useState } from 'react'

const MENTORS = [
  {
    id: 1,
    name: 'Aryan Kapoor',
    role: 'AI Engineer @ Zepto',
    domains: ['ML', 'Python', 'Product'],
    initials: 'AK',
    color: '#60A5FA',
    bio: 'Built Zepto\'s recommendation engine from scratch. Loves helping students get their first ML model into production.',
    slotsLeft: 2,
  },
  {
    id: 2,
    name: 'Priya Mehta',
    role: 'Founder @ EdTech startup',
    domains: ['Education', 'No-code', 'Business'],
    initials: 'PM',
    color: '#34D399',
    bio: 'Turned a college project into a 10,000-student platform. Knows how to go from idea to real users in weeks.',
    slotsLeft: 1,
  },
  {
    id: 3,
    name: 'Rahul Singh',
    role: 'ML Researcher @ IIT Delhi',
    domains: ['Deep Learning', 'Data', 'Research'],
    initials: 'RS',
    color: '#C084FC',
    bio: 'Published AI researcher who makes complex concepts click. Perfect mentor for students exploring ML applications.',
    slotsLeft: 3,
  },
]

const MAX_SESSIONS = 2

export function MentorCards() {
  const [booked, setBooked]         = useState<number[]>([])
  const [confirming, setConfirming] = useState<number | null>(null)
  const [toast, setToast]           = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function handleBook(id: number) {
    if (booked.length >= MAX_SESSIONS) {
      showToast('You\'ve used both your booking slots.')
      return
    }
    setConfirming(id)
  }

  function confirmBook(id: number) {
    setBooked(prev => [...prev, id])
    setConfirming(null)
    showToast('Booked! Calendar invite and Zoom link will arrive by email within 24 hrs.')
  }

  const sessionsLeft = MAX_SESSIONS - booked.length

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl font-body text-sm max-w-[90vw] shadow-lg"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-soft)', color: 'var(--text-1)' }}
        >
          {toast}
        </div>
      )}

      {/* Sessions counter */}
      <div
        className="rounded-2xl border p-4 flex items-center justify-between gap-3"
        style={{ background: 'rgba(255,184,0,0.06)', borderColor: 'rgba(255,184,0,0.2)' }}
      >
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-0.5" style={{ color: 'var(--text-brand)' }}>
            ⭐ Premium — 1:1 Mentorship
          </p>
          <p className="font-body text-sm" style={{ color: 'var(--text-3)' }}>
            Sessions run May 26 – Jun 6 · 30 mins per slot
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display text-2xl leading-none" style={{ color: sessionsLeft > 0 ? 'var(--brand)' : 'var(--text-4)' }}>
            {sessionsLeft}
          </p>
          <p className="font-mono text-[10px]" style={{ color: 'var(--text-4)' }}>
            slot{sessionsLeft !== 1 ? 's' : ''} left
          </p>
        </div>
      </div>

      {/* Mentor cards */}
      <div className="space-y-4">
        {MENTORS.map(mentor => {
          const isBooked   = booked.includes(mentor.id)
          const noSlotsLeft = sessionsLeft === 0 && !isBooked
          return (
            <div
              key={mentor.id}
              className="rounded-2xl border overflow-hidden"
              style={{ background: 'var(--bg-card)', borderColor: isBooked ? `${mentor.color}30` : 'var(--border-faint)' }}
            >
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-heading font-bold text-base shrink-0 border-2"
                    style={{
                      background:  `${mentor.color}18`,
                      borderColor: `${mentor.color}50`,
                      color:       mentor.color,
                    }}
                  >
                    {mentor.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-base leading-tight" style={{ color: 'var(--text-1)' }}>
                      {mentor.name}
                    </h3>
                    <p className="font-body text-sm" style={{ color: mentor.color }}>
                      {mentor.role}
                    </p>
                  </div>
                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded-full border shrink-0"
                    style={{
                      background:  mentor.slotsLeft > 0 ? 'rgba(34,197,94,0.08)' : 'var(--bg-float)',
                      borderColor: mentor.slotsLeft > 0 ? 'rgba(34,197,94,0.3)' : 'var(--border-subtle)',
                      color:       mentor.slotsLeft > 0 ? 'var(--green)' : 'var(--text-4)',
                    }}
                  >
                    {mentor.slotsLeft} open
                  </span>
                </div>

                {/* Bio */}
                <p className="font-body text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                  {mentor.bio}
                </p>

                {/* Domain pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {mentor.domains.map(d => (
                    <span
                      key={d}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-full border"
                      style={{
                        background:  `${mentor.color}10`,
                        borderColor: `${mentor.color}30`,
                        color:       mentor.color,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>

                {/* Book button */}
                <button
                  onClick={() => handleBook(mentor.id)}
                  disabled={isBooked || noSlotsLeft || mentor.slotsLeft === 0}
                  className="min-h-[44px] px-5 rounded-xl font-heading font-bold text-sm tracking-wide transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:  isBooked ? `${mentor.color}15` : noSlotsLeft || mentor.slotsLeft === 0 ? 'var(--bg-float)' : 'var(--brand)',
                    color:       isBooked ? mentor.color : noSlotsLeft || mentor.slotsLeft === 0 ? 'var(--text-4)' : '#000',
                    border:      isBooked || noSlotsLeft || mentor.slotsLeft === 0 ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  {isBooked ? `✓ Booked with ${mentor.name.split(' ')[0]}` : mentor.slotsLeft === 0 ? 'Fully Booked' : '📅 Book a Slot'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Booking confirmation overlay */}
      {confirming !== null && (() => {
        const m = MENTORS.find(x => x.id === confirming)!
        return (
          <div
            className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setConfirming(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: 'var(--bg-raised)', border: `1px solid ${m.color}40` }}
              onClick={e => e.stopPropagation()}
            >
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--text-brand)' }}>
                Confirm Booking
              </p>
              <h3 className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text-1)' }}>
                {m.name}
              </h3>
              <p className="font-body text-sm leading-relaxed mb-5" style={{ color: 'var(--text-3)' }}>
                30-minute session · {m.role}
                <br />
                You'll receive a calendar invite + Zoom link via email within 24 hours of confirmation.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => confirmBook(confirming)}
                  className="flex-1 min-h-[44px] rounded-xl font-heading font-bold text-sm transition-all active:scale-95"
                  style={{ background: 'var(--brand)', color: '#000' }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  className="flex-1 min-h-[44px] rounded-xl font-heading font-semibold text-sm border transition-all active:scale-95"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-2)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
