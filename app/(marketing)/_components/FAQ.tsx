'use client'

import { motion, type Variants } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const EASE_OUT = [0.16, 1, 0.3, 1] as const

const STUDENT_FAQS = [
  {
    q: 'Do I need coding experience to join?',
    a: 'No prior coding experience required. If you can use a smartphone and are curious about technology, you are ready. The workshops start from zero and use AI tools (like ChatGPT, Replit, and Bolt) that let you build without writing traditional code. Students who have never coded before have built working prototypes.',
  },
  {
    q: 'What exactly will I build?',
    a: 'You will build a real AI-powered product — an app, web tool, or AI prototype — that solves a real-world problem in a domain you care about (health, education, environment, finance, entertainment, or social impact). By the end of the programme, you will have a live demo you can show colleges, parents, and employers.',
  },
  {
    q: 'Can I participate solo or do I need a team?',
    a: "Both options work. You can register as a solo builder or form a team of up to 3. If you want a team but don't know anyone, we'll help you find teammates from your city or grade during the orientation phase. Teams are optional — plenty of winners have been solo builders.",
  },
  {
    q: 'What if I miss a live workshop?',
    a: "Every workshop is recorded and uploaded within 2 hours of the session ending. You can watch the replay at your own pace and still earn the badge and XP for that workshop. Live attendance gets a small bonus XP, but missing a session won't block your progress.",
  },
  {
    q: 'How does the 24-hour hackathon work?',
    a: 'The hackathon runs from June 7 at 8:00 AM IST to June 8 at 8:00 AM IST — fully online. You build your project, record a 3-minute demo video, and submit before the deadline. Judges score independently, and results are announced on June 9–10. You can build solo or as a team. Sleep is optional 😄',
  },
  {
    q: 'What prizes can I win?',
    a: 'The total prize pool is ₹1,00,000+. Top winners receive cash prizes, premium AI tool subscriptions, mentorship sessions with industry professionals, and feature placement on the zer0.pro platform. Every participant who submits a project earns the Hacker badge (+300 XP) and a completion certificate.',
  },
  {
    q: 'When do I receive my certificate?',
    a: 'Completion certificates are issued on June 9–10 for all students who submit a project during the hackathon. Premium tier participants also receive a verified LinkedIn certificate that can be added directly to your LinkedIn profile — a real, verifiable credential.',
  },
  {
    q: 'How does the referral programme work?',
    a: "Every registered student gets a unique referral code. When a friend registers using your code and completes payment, you earn a cash voucher. There is no limit to how many friends you can refer — the more builders you bring in, the more you earn. Vouchers are credited within 48 hours of your friend's payment confirmation.",
  },
]

const PARENT_FAQS = [
  {
    q: 'Is this programme safe for my child?',
    a: '100% online with all sessions recorded. No physical meetings or travel required. Every mentor is personally verified by the zer0.pro team before interacting with students. Session recordings are available to parents on request. We operate a dedicated parent WhatsApp group where any concern can be raised directly with the organising team.',
  },
  {
    q: 'Who are the mentors and instructors?',
    a: 'All mentors are working professionals from the technology industry — software engineers, AI researchers, and product designers. Every mentor is verified by zer0.pro before being assigned to students. Mentors do not have access to any personal information beyond the student\'s first name and grade. All 1:1 mentorship sessions are conducted via the official platform, not on personal channels.',
  },
  {
    q: 'What is the refund policy?',
    a: 'Full refund if the programme does not start as scheduled on May 26. No forms, no questions asked — refund is processed within 5–7 business days. If your child has a documented medical emergency after joining, contact us directly and we will assess on a case-by-case basis. We want every family to feel safe making this investment.',
  },
  {
    q: 'Will this interfere with my child\'s board exam preparation?',
    a: 'The programme is designed around school schedules. Workshops are 75–90 minutes each, held on weekends or evenings. The total time commitment is approximately 4–6 hours per week. The hackathon falls on June 7–8, after most board exams are complete. Class 10 and 12 students have successfully participated while managing their studies.',
  },
  {
    q: 'What device and internet does my child need?',
    a: 'Any smartphone, tablet, or laptop with a stable internet connection works. A budget Android phone on a Jio or Airtel 4G connection is sufficient for all sessions and building activities. No high-end hardware is needed. If your child has access to a laptop, that is a bonus — but not required.',
  },
  {
    q: 'Can I attend the workshops and sessions alongside my child?',
    a: 'Yes, absolutely. Parents are welcome to join any live workshop session. We also run a free 30-minute parent info session before the programme starts, where we walk through the curriculum, introduce the mentors, and answer your questions directly. Join us — the more involved parents are, the better their child does.',
  },
]

/* ─── Variants ───────────────────────────────────────────────────────────────── */
const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
}

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.15 } },
}

/* ─── FAQ ────────────────────────────────────────────────────────────────────── */
export function FAQ() {
  return (
    <section
      className="relative py-20 sm:py-28 overflow-hidden"
      id="faq"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Subtle left-side glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 40% 60% at 0% 50%, rgba(255,184,0,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <motion.div
          className="mb-12 text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <p
            className="font-mono text-[12px] tracking-[0.28em] uppercase mb-3"
            style={{ color: 'var(--text-brand)' }}
          >
            FAQ
          </p>
          <h2
            className="font-display leading-none tracking-tight"
            style={{ fontSize: 'clamp(28px, 5vw, 64px)', color: 'var(--text-1)' }}
          >
            QUESTIONS?{' '}
            <span style={{ color: 'var(--text-brand)' }}>WE&apos;VE GOT ANSWERS</span>
          </h2>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <Tabs defaultValue="students">
            <TabsList
              className="w-full mb-8 h-12 p-1 rounded-[6px]"
              style={{
                background:   'var(--bg-raised)',
                border:       '1px solid var(--border-faint)',
              }}
            >
              <TabsTrigger
                value="students"
                className="flex-1 h-full rounded-[4px] font-heading font-semibold text-[13px] tracking-[0.06em] uppercase transition-all duration-200 data-[state=active]:shadow-none"
                style={{
                  color: 'var(--text-3)',
                }}
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="parents"
                className="flex-1 h-full rounded-[4px] font-heading font-semibold text-[13px] tracking-[0.06em] uppercase transition-all duration-200 data-[state=active]:shadow-none"
                style={{
                  color: 'var(--text-3)',
                }}
              >
                Parents
              </TabsTrigger>
            </TabsList>

            {/* Student FAQs */}
            <TabsContent value="students" className="mt-0">
              <Accordion type="single" collapsible className="flex flex-col gap-2">
                {STUDENT_FAQS.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`student-${i}`}
                    className="rounded-[6px] border px-4 overflow-hidden"
                    style={{
                      background:  'var(--bg-card)',
                      borderColor: 'var(--border-faint)',
                    }}
                  >
                    <AccordionTrigger
                      className="min-h-[44px] py-3 font-heading font-semibold text-[14px] leading-snug text-left hover:no-underline active:opacity-70 [&>svg]:text-[var(--text-4)] [&>svg]:flex-shrink-0"
                      style={{ color: 'var(--text-1)' }}
                    >
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent
                      className="font-body text-[13px] leading-relaxed pb-5 pt-0"
                      style={{ color: 'var(--text-2)' }}
                    >
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            {/* Parent FAQs */}
            <TabsContent value="parents" className="mt-0">
              <Accordion type="single" collapsible className="flex flex-col gap-2">
                {PARENT_FAQS.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`parent-${i}`}
                    className="rounded-[6px] border px-4 overflow-hidden"
                    style={{
                      background:  'var(--bg-card)',
                      borderColor: 'var(--border-faint)',
                    }}
                  >
                    <AccordionTrigger
                      className="min-h-[44px] py-3 font-heading font-semibold text-[14px] leading-snug text-left hover:no-underline active:opacity-70 [&>svg]:text-[var(--text-4)] [&>svg]:flex-shrink-0"
                      style={{ color: 'var(--text-1)' }}
                    >
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent
                      className="font-body text-[13px] leading-relaxed pb-5 pt-0"
                      style={{ color: 'var(--text-2)' }}
                    >
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* ── Still have questions ── */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="font-body text-[13px]" style={{ color: 'var(--text-4)' }}>
            Still have questions?{' '}
            <a
              href="https://wa.me/919325235592"
              className="transition-colors duration-150"
              style={{ color: 'var(--text-brand)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.75' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us →
            </a>
          </p>
        </motion.div>

      </div>
    </section>
  )
}
