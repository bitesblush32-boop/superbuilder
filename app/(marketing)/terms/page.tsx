import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDatesConfig } from '@/lib/db/queries/config'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Super Builders — zer0.pro',
  description:
    'Registration Agreement for Super Builders Origins – School Edition Season 1, 2026. Includes Terms and Conditions, Privacy Policy, and Parental Consent Form.',
  robots: { index: true, follow: true },
}

/* ─── Table of contents items ─────────────────────────────────────────────── */
const TOC = [
  { id: 'terms', label: 'Part 1 — Terms & Conditions' },
  { id: 'privacy', label: 'Part 2 — Privacy Policy' },
  { id: 'consent', label: 'Part 3 — Parental Consent Form' },
] as const

/* ─── Small reusable section header ──────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-heading font-bold text-base mt-8 mb-3 pb-2 border-b"
      style={{ color: 'var(--text-brand)', borderColor: 'var(--border-brand)' }}
    >
      {children}
    </h3>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="font-heading font-semibold text-sm mt-5 mb-2"
      style={{ color: 'var(--text-1)' }}
    >
      {children}
    </h4>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>
      {children}
    </p>
  )
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="mb-3 space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 font-body text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
          <span style={{ color: 'var(--text-brand)' }} className="mt-0.5 shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/* ─── Clause row (numbered) ───────────────────────────────────────────────── */
function Clause({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-3">
      <span
        className="font-mono text-xs shrink-0 mt-0.5 w-8"
        style={{ color: 'var(--text-4)' }}
      >
        {num}
      </span>
      <div className="font-body text-sm leading-relaxed flex-1" style={{ color: 'var(--text-2)' }}>
        {children}
      </div>
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default async function TermsPage() {
  const dates = await getDatesConfig()

  return (
    <>
      <Navbar
        regDeadlineISO={dates.regDeadlineISO}
        regDeadlineDisplay={dates.regDeadlineDisplay}
      />

      <main
        className="min-h-screen pt-[72px] pb-20"
        style={{ background: 'var(--bg-base)' }}
      >
        {/* ── Page hero ── */}
        <div
          className="border-b py-10 px-4"
          style={{
            background: 'linear-gradient(180deg, rgba(255,184,0,0.06) 0%, transparent 100%)',
            borderColor: 'var(--border-brand)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <p
              className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3"
              style={{ color: 'var(--text-brand)' }}
            >
              zer0.pro · Super Builders Origins
            </p>
            <h1
              className="font-display text-4xl md:text-5xl mb-2"
              style={{ color: 'var(--text-1)' }}
            >
              Registration Agreement
            </h1>
            <p
              className="font-mono text-xs tracking-wider mb-4"
              style={{ color: 'var(--text-3)' }}
            >
              Season 1, 2026 · Effective Date: 20 April 2026
            </p>
            <p className="font-body text-sm leading-relaxed max-w-2xl" style={{ color: 'var(--text-2)' }}>
              This document contains the <strong style={{ color: 'var(--text-1)' }}>Terms and Conditions</strong>,{' '}
              <strong style={{ color: 'var(--text-1)' }}>Privacy Policy</strong>, and{' '}
              <strong style={{ color: 'var(--text-1)' }}>Parental Consent Form</strong> for the Super Builders
              Origins – School Edition programme. By ticking the checkbox at the bottom of the registration form,
              the parent or guardian confirms that they have read all three sections in full and agree to every
              term contained herein on behalf of the student participant. Participation is conditional upon this
              agreement being completed.
            </p>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 mt-6">
              {TOC.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="inline-flex items-center h-8 px-3 rounded-sm font-mono text-[10px] tracking-widest uppercase border transition-all duration-150 hover:border-[var(--border-brand-strong)]"
                  style={{
                    borderColor: 'var(--border-brand)',
                    color: 'var(--text-brand)',
                    background: 'var(--brand-subtle)',
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-3xl mx-auto px-4 pt-10">

          {/* ════════════════════════════════════════════════════
              PART 1 — TERMS AND CONDITIONS
          ════════════════════════════════════════════════════ */}
          <section id="terms" className="scroll-mt-20 mb-16">
            <div
              className="inline-flex items-center h-7 px-3 rounded-sm font-mono text-[10px] tracking-[0.2em] uppercase border mb-6"
              style={{
                borderColor: 'var(--border-brand)',
                color: 'var(--text-brand)',
                background: 'var(--brand-subtle)',
              }}
            >
              Part 1
            </div>
            <h2
              className="font-display text-3xl md:text-4xl mb-1"
              style={{ color: 'var(--text-1)' }}
            >
              Terms and Conditions
            </h2>
            <p className="font-mono text-xs mb-8" style={{ color: 'var(--text-4)' }}>
              Effective Date: 20 April 2026 · Version: Season 1, 2026
            </p>
            <P>
              By agreeing to these Terms and Conditions, you also agree to the Privacy Policy as set out in Part 2 of
              this agreement.
            </P>

            {/* 1 */}
            <SectionHeading>1. About the Programme</SectionHeading>
            <Clause num="1.1">
              Super Builders Origins – School Edition ("Programme") is a 3-week online AI learning programme and
              24-hour hackathon organised by Zer0 Pro (Zer0th Protocol), operated by Tech Zer0 Private Limited
              ("Zer0 Pro", "we", "us").
            </Clause>
            <Clause num="1.2">
              The Programme is delivered fully online through events.zer0.pro and includes three structured
              workshops, a Build Phase, a 24-hour live hackathon, mentorship sessions, a Demo Day, and a prize
              distribution.
            </Clause>
            <Clause num="1.3">
              These Terms and Conditions govern the registration, participation, conduct, data use, and all other
              aspects of the Programme for all students, parents, and guardians.
            </Clause>

            {/* 2 */}
            <SectionHeading>2. Eligibility</SectionHeading>
            <Clause num="2.1">
              The Programme is open to students currently enrolled in Classes 8 through 12 in India, between the
              ages of 13 and 18.
            </Clause>
            <Clause num="2.2">
              All participants are minors below 18 years. A parent or guardian must complete the registration and
              agree to these Terms on the student's behalf. Registration is not valid without this.
            </Clause>
            <Clause num="2.3">
              Each student must have access to a device (laptop, tablet, or desktop computer) with a stable internet
              connection for the full duration of the Programme.
            </Clause>
            <Clause num="2.4">
              Mentors, judges, employees, interns, and contractors of Zer0 Pro, and their immediate family members,
              are not eligible to participate as students.
            </Clause>
            <Clause num="2.5">
              We reserve the right to verify eligibility at any stage and to cancel a registration if information
              provided is found to be false or inaccurate.
            </Clause>

            {/* 3 */}
            <SectionHeading>3. Registration</SectionHeading>
            <Clause num="3.1">
              Registration must be completed exclusively through the official platform at events.zer0.pro.
              Registrations made through any other channel are invalid.
            </Clause>
            <Clause num="3.2">
              By ticking the agreement checkbox during registration, the parent or guardian confirms that they are
              the legal parent or guardian of the student, that all information submitted is accurate and complete,
              and that they agree to these Terms, the Privacy Policy, and the Parental Consent Form in full.
            </Clause>
            <Clause num="3.3">
              This digital acceptance constitutes a valid and binding agreement under applicable law.
            </Clause>
            <Clause num="3.4">
              Verifiable parental consent is mandatory for all participants under 18 years, in accordance with
              applicable law.
            </Clause>

            {/* 4 */}
            <SectionHeading>4. Programme Plans and Payment</SectionHeading>
            <Clause num="4.1">
              <strong style={{ color: 'var(--text-1)' }}>Programme Pricing &amp; Benefits</strong>
              <br />
              The Programme is offered based on participation type. All plans include access to core learning,
              mentorship, and certification benefits.
            </Clause>

            {/* Plans */}
            <div className="space-y-4 my-4 ml-10">
              {[
                {
                  title: '1. Solo Participation (Rs. 3,499)',
                  items: [
                    'Access to all 3 workshops',
                    'Group mentorship sessions',
                    'Participation certificate',
                    'Digital badge',
                  ],
                },
                {
                  title: '2. Team of 2 (Rs. 6,000 | Rs. 3,000 per participant)',
                  items: [
                    'Access to all 3 workshops (per participant)',
                    'Group mentorship sessions',
                    'Participation certificate (each member)',
                    'Digital badge (each member)',
                    'Enhanced collaboration experience with team-based project work.',
                  ],
                },
                {
                  title: '3. Team of 3 (Rs. 9,000 | Rs. 3,000 per participant)',
                  items: [
                    'Access to all 3 workshops (per participant)',
                    'Group mentorship sessions.',
                    'Participation certificate (each member)',
                    'Digital badge (each member)',
                    'Priority judging for team submissions.',
                    'Team-based project experience with collaborative learning',
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className="rounded-lg border p-4"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-faint)',
                  }}
                >
                  <p className="font-heading font-semibold text-sm mb-2" style={{ color: 'var(--text-1)' }}>
                    {plan.title}
                  </p>
                  <Ul items={plan.items} />
                </div>
              ))}

              {/* Additional */}
              <div
                className="rounded-lg border p-4"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-faint)' }}
              >
                <p className="font-heading font-semibold text-sm mb-2" style={{ color: 'var(--text-1)' }}>
                  Additional Benefits (Applicable to All Participants)
                </p>
                <Ul items={[
                  'Hands-on project building experience',
                  'Exposure to real-world problem statements',
                  'Opportunity to showcase work to mentors/judges',
                ]} />
              </div>
            </div>

            <Clause num="4.2">
              All payments are made through the payment gateway on the official platform. We do not accept cash,
              cheques, or bank transfers.
            </Clause>
            <Clause num="4.3">
              The registration deadline is 25 May. We may close registrations earlier if capacity is reached.
            </Clause>

            {/* 5 — REFUND */}
            <SectionHeading>
              <span id="refund" className="scroll-mt-20">5. Refunds and Cancellations</span>
            </SectionHeading>
            <Clause num="5.1">
              <strong style={{ color: 'var(--text-1)' }}>Full Refund:</strong> A full refund is issued if Zer0 Pro
              cancels or fails to launch the Programme before it begins.
            </Clause>
            <Clause num="5.2">
              <strong style={{ color: 'var(--text-1)' }}>No Refund:</strong> No refund is issued once the Programme
              begins (after 26 May), including where a student voluntarily withdraws, is disqualified, or misses
              sessions.
            </Clause>
            <Clause num="5.3">
              Refund requests must be submitted by email to{' '}
              <a
                href="mailto:team@0x.day"
                className="underline underline-offset-2 transition-colors"
                style={{ color: 'var(--text-brand)' }}
              >
                team@0x.day
              </a>
              . Approved refunds are processed within 14 working days.
            </Clause>

            {/* 6 */}
            <SectionHeading>6. Programme Schedule</SectionHeading>
            <Clause num="6.1">
              The Programme runs across the following phases:
              <Ul items={[
                'Registration: 20 April 2026 to 25 May 2026',
                'Orientation and Onboarding: 26 May to 1 June',
                'Workshops (3 sessions): 26 May to 5 June',
                'Build Phase: 1 June to 6 June',
                '24-Hour Hackathon: 6 June (8:00 AM IST) to 7 June (8:00 AM IST)',
                'Demo Day 27 June',
                'Winners Announcement and Certificates: 1 July',
                'Certificate Distribution 5 July',
              ]} />
            </Clause>
            <Clause num="6.2">
              All sessions are conducted online and are recorded. Replays are made available within 24 hours on the
              student dashboard.
            </Clause>
            <Clause num="6.3">
              Project submissions must be completed by 8 June at 8:00 AM IST. Late submissions are not accepted for
              judging.
            </Clause>
            <Clause num="6.4">
              Dates, speakers, and session formats may change. We will inform participants and parents of material
              changes by email or Discord.
            </Clause>

            {/* 7 */}
            <SectionHeading>7. Code of Conduct and Disqualification</SectionHeading>
            <Clause num="7.1">
              All participants must conduct themselves with respect, integrity, and professionalism across all
              Programme spaces, including during sessions, on Discord, and in all virtual interactions.
            </Clause>
            <Clause num="7.2">
              A participant will be disqualified without refund for any of the following:
              <Ul items={[
                'submitting plagiarised, copied, or previously published work;',
                'harassing, bullying, or using abusive language towards any participant, mentor, judge, or organiser;',
                'providing false information during registration or about their submission;',
                'attempting to manipulate or interfere with the judging process;',
                'accessing or interfering with another participant\'s account or project;',
                'sharing harmful, offensive, or misleading content in Programme channels; or',
                'any other conduct that Zer0 Pro determines undermines the safety, fairness, or integrity of the Programme.',
              ]} />
            </Clause>
            <Clause num="7.3">
              Zer0 Pro's decision on all conduct and disqualification matters is final and binding.
            </Clause>

            {/* 8 */}
            <SectionHeading>8. Intellectual Property</SectionHeading>
            <Clause num="8.1">
              By submitting a project, the student grants Zer0 Pro a non-exclusive, royalty-free licence to display,
              feature, and promote their project for event documentation, social media, press releases, and future
              programme promotion, with attribution to the student.
            </Clause>
            <Clause num="8.2">
              Zer0 Pro will not claim ownership of, sell, or sub-license a student's work without prior notice to
              the student and their parent or guardian.
            </Clause>
            <Clause num="8.3">
              Students must ensure their submissions do not infringe any third-party intellectual property. Zer0 Pro
              is not liable for any such claims.
            </Clause>
            <Clause num="8.4">
              All Zer0 Pro brand materials, platform content, and curriculum are our intellectual property and may
              not be reproduced without our written permission.
            </Clause>
            <Clause num="8.5">
              Zer0 Pro may, from time to time, receive requests from third parties in relation to student
              submissions. By submitting such content, students expressly consent to Zer0 Pro using, sharing, and
              licensing such submissions for the purpose of developing, improving or commercializing products or
              services in collaboration with such third parties.
            </Clause>

            {/* 9 */}
            <SectionHeading>9. Prizes and Certificates</SectionHeading>
            <Clause num="9.1">
              The Season 1 prize pool is Rs. 1,00,000 or more. Prize amounts and distribution are at the sole
              discretion of the judging panel and are final.
            </Clause>
            <Clause num="9.2">
              Projects are evaluated on: Innovation and Originality (25%), Impact and Problem-Solution Fit (25%),
              Technical Implementation (25%), Presentation Quality (15%), and Submission Completeness (10%).
            </Clause>
            <Clause num="9.3">
              All students who complete the Programme receive a participation certificate. Premium Plan students
              receive a verified digital certificate shareable on LinkedIn.
            </Clause>
            <Clause num="9.4">
              Prizes are subject to applicable tax deduction at source (TDS) under Indian law. Tax liability rests
              with the prize recipient.
            </Clause>
            <Clause num="9.5">
              Prizes and certificates may be withheld or revoked where a participant has violated these Terms.
            </Clause>

            {/* 10 */}
            <SectionHeading>10. Referral Programme</SectionHeading>
            <Clause num="10.1">
              Each confirmed and paid participant receives a unique referral code upon registration.
            </Clause>
            <Clause num="10.2">
              For each friend who registers and pays using their referral code, the referring student earns a reward
              of Rs. 200 in the form of an Amazon voucher or equivalent.
            </Clause>
            <Clause num="10.3">
              The top referrer each week receives an additional mention on the Programme Discord and a bonus badge.
            </Clause>
            <Clause num="10.4">
              Zer0 Pro reserves the right to modify or discontinue the referral programme at any time, with notice
              to participants.
            </Clause>

            {/* 11 */}
            <SectionHeading>11. Limitation of Liability</SectionHeading>
            <Clause num="11.1">
              The Programme is provided on an as-is basis. We make no guarantee of any specific learning outcome,
              career result, or prize from participation.
            </Clause>
            <Clause num="11.2">
              We are not liable for technical failures including internet outages, device issues, or platform
              disruptions affecting participation.
            </Clause>
            <Clause num="11.3">
              Our maximum liability to any participant shall not exceed the registration fee paid by that
              participant for the current season.
            </Clause>
            <Clause num="11.4">
              We are not liable for events beyond our reasonable control, including natural disasters, government
              directives, pandemic, political aspects or internet infrastructure failures.
            </Clause>
            <Clause num="11.5">
              We shall not be liable for any incidental, indirect, special, or consequential damages arising out of
              or in connection with the program.
            </Clause>

            {/* 12 */}
            <SectionHeading>12. Governing Law</SectionHeading>
            <Clause num="12.1">
              These Terms are governed by the laws of India.
            </Clause>
            <Clause num="12.2">
              Any disputes arising out of or in connection with these Terms shall be resolved amicably between the
              Parties. In the event such resolution is not achieved, the disputes shall be subject to the exclusive
              jurisdiction of the competent courts in Bengaluru, Karnataka, India.
            </Clause>

            {/* 13 */}
            <SectionHeading>13. Miscellaneous</SectionHeading>
            <Clause num="13.1">
              If any provision of these Terms is held to be unenforceable, the remaining provisions continue in
              full force.
            </Clause>
            <Clause num="13.2">
              We may amend these Terms from time to time. Material changes will be communicated with at least 48
              hours notice by email. Continued participation following that notice constitutes acceptance of the
              revised Terms.
            </Clause>
          </section>

          {/* ════════════════════════════════════════════════════
              PART 2 — PRIVACY POLICY
          ════════════════════════════════════════════════════ */}
          <section id="privacy" className="scroll-mt-20 mb-16">
            <div
              className="inline-flex items-center h-7 px-3 rounded-sm font-mono text-[10px] tracking-[0.2em] uppercase border mb-6"
              style={{
                borderColor: 'var(--border-brand)',
                color: 'var(--text-brand)',
                background: 'var(--brand-subtle)',
              }}
            >
              Part 2
            </div>
            <h2
              className="font-display text-3xl md:text-4xl mb-1"
              style={{ color: 'var(--text-1)' }}
            >
              Privacy Policy
            </h2>
            <p className="font-mono text-xs mb-8" style={{ color: 'var(--text-4)' }}>
              Issued under the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)
            </p>

            <SectionHeading>1. Who We Are</SectionHeading>
            <P>
              This Privacy Policy is issued by <strong style={{ color: 'var(--text-1)' }}>Tech Zer0 Private
                Limited</strong>, operating as <strong style={{ color: 'var(--text-1)' }}>Zer0 Pro (Zer0th
                  Protocol)</strong> (CIN: U62099KA2024PTC187319), registered in Bengaluru, Karnataka. We are the Data
              Fiduciary in respect of all personal data collected in connection with the Super Builders Origins –
              School Edition programme, and we are responsible for its lawful processing under the DPDP Act, 2023.
            </P>

            <SectionHeading>2. Who This Policy Applies To</SectionHeading>
            <Clause num="2.1">
              This Policy applies to all students registered for the Programme (Classes 8–12, ages 13–18) and their
              parents or guardians.
            </Clause>
            <Clause num="2.2">
              All references to data rights and consents in this Policy are exercised by the parent or guardian on
              the student's behalf.
            </Clause>

            <SectionHeading>3. What Data We Collect</SectionHeading>
            <P>We collect the following personal data during registration and participation:</P>

            <SubHeading>Student Data:</SubHeading>
            <Ul items={[
              'Full name (as on school records), age, date of birth, and gender',
              'Grade or class, school name, city, and state',
              'Student email address (for students aged 16 and above)',
              'Student phone number or WhatsApp number',
              'Prior coding experience, interests, learning goals, and team preference',
              'Availability and device access information',
              'Instagram or LinkedIn handle (optional, for student showcase)',
              'T-shirt size (for prize winners only)',
              'Referral code used (if applicable)',
              'Quiz scores, idea submissions, project files, and workshop attendance records',
              'Photographs, video recordings, testimonies or voice recordings from workshops, hackathon, personal data or Demo Day',
            ]} />

            <SubHeading>Parent or Guardian Data:</SubHeading>
            <Ul items={[
              'Full name, relationship to the student',
              'Email address and phone or WhatsApp number',
              'Emergency contact number',
            ]} />

            <SubHeading>Payment Data:</SubHeading>
            <Ul items={[
              'Registration fee payment confirmation and transaction reference',
              'EMI or instalment records, where applicable',
            ]} />
            <P>
              <em>Note: Zer0 Pro does not store card numbers, bank account details, or UPI credentials. Payment
                processing is handled exclusively by our authorised payment gateway partner.</em>
            </P>

            <SectionHeading>4. Why We Collect This Data</SectionHeading>
            <P>We collect and use personal data only for the following purposes:</P>
            <Ul items={[
              'Registering students, verifying eligibility, and obtaining verifiable parental consent',
              'Onboarding participants onto the programme platform and Discord/Telegram community',
              'Delivering workshops, mentor sessions, hackathon activities, and Demo Day',
              'Processing payments and managing registration tiers',
              'Sending programme communications, reminders, and updates to students and parents via email and WhatsApp',
              'Evaluating project submissions and administering the judging process',
              'Announcing results, distributing prizes, and issuing certificates',
              'Running the referral programme and tracking referral codes',
              'Conducting internal reporting, analytics, and post-event feedback',
              'Using photographs and recordings for social media posts, event highlight reels and documentation, press releases and media coverage, internal reports and presentations and promotion of future programmes',
              'Ensuring online safety, child protection, and compliance with applicable law',
              'To Media partners and event partners for operational purposes',
              'Marketing campaigns',
            ]} />

            <SectionHeading>5. Legal Basis for Processing</SectionHeading>
            <Clause num="5.1">
              <strong style={{ color: 'var(--text-1)' }}>Consent:</strong> The parent or guardian provides free,
              specific, informed, and unambiguous consent at registration for all core programme activities and for
              media and promotional use as set out in this document.
            </Clause>
            <Clause num="5.2">
              <strong style={{ color: 'var(--text-1)' }}>Certain Legitimate Uses:</strong> Processing necessary for
              the performance of the registration and programme delivery contract and for compliance with applicable
              law.
            </Clause>

            <SectionHeading>6. Protections for Children's Data</SectionHeading>
            <Clause num="6.1">
              Zer0 Pro does not undertake any processing of a student's personal data that is likely to cause any
              detrimental effect on the well-being of the child, in compliance with protection law.
            </Clause>
            <Clause num="6.2">
              Zer0 Pro does not carry out behavioural tracking or profiling directed at any student participant, in
              compliance with applicable data protection law.
            </Clause>

            <SectionHeading>7. Who We Share Data With</SectionHeading>
            <Clause num="7.1">
              We share personal data only with third parties engaged to deliver the Programme. All such parties are
              Data Processors under Section 2(k) of the DPDP Act and are bound by written agreements prohibiting
              them from using student data for their own purposes.
            </Clause>
            <Clause num="7.2">
              Third parties include:
              <Ul items={[
                'Payment gateway providers (for fee processing)',
                'Email and WhatsApp communication platforms',
                'CRM and automation platforms',
                'Video conferencing platforms (for workshops and mentorship)',
                'Discord/Telegram (community management)',
                'Certificate and digital badge issuance platforms',
                'Media and photography partners (for event documentation)',
                'Media Partners, event partners and sponsors',
                'Verified mentors (limited to project-related data required for mentorship)',
              ]} />
            </Clause>
            <Clause num="7.3">
              We may share limited student information, including name and contact details, with select partners to
              enable them to reach out to you regarding relevant offering.
            </Clause>

            <SectionHeading>8. Data Storage and Retention</SectionHeading>
            <Clause num="8.1">
              All data is stored securely on Zer0 Pro's platform and with authorised third-party processors, with
              appropriate technical and organisational safeguards against unauthorised access, disclosure, or breach.
            </Clause>
            <Clause num="8.2">
              Programme data (registrations, submissions, scores, certificates) is retained for two years from the
              conclusion of the Programme, unless a longer period is required by law.
            </Clause>
            <Clause num="8.3">
              Payment records are retained as required under applicable financial and tax laws.
            </Clause>
            <Clause num="8.4">
              Media content (photographs and recordings) is retained for the duration of its promotional use, as
              consented to under Part 3 of this document.
            </Clause>
            <Clause num="8.5">
              Upon expiry of the applicable retention period, personal data is securely erased or anonymised in
              accordance with applicable data protection laws.
            </Clause>

            <SectionHeading>9. Data Breach</SectionHeading>
            <P>
              In the event of a breach involving personal data, we shall promptly implement appropriate technical
              and organizational measures to contain, investigate, and remediate the breach in compliance with
              applicable data protection laws. Where required, we shall notify the competent regulatory authorities
              and/or affected data subjects within 48 to 72 hours of becoming aware of such breach.
            </P>

            <SectionHeading>10. Grievance Redressal</SectionHeading>
            <P>
              For any queries or complaints regarding the processing of personal data, contact our grievance officer
              at{' '}
              <a
                href="mailto:team@0x.day"
                className="underline underline-offset-2"
                style={{ color: 'var(--text-brand)' }}
              >
                team@0x.day
              </a>{' '}
              or{' '}
              <a
                href="tel:+916363627881"
                className="underline underline-offset-2"
                style={{ color: 'var(--text-brand)' }}
              >
                +91 6363627881
              </a>
              . We will respond within a reasonable period. If unresolved, a complaint may be filed with the Data
              Protection Board of India under applicable provisions of protection law.
            </P>

            <SectionHeading>11. Governing Law</SectionHeading>
            <P>
              This Policy is governed by the laws of India. Disputes are subject to the exclusive jurisdiction of
              the courts at Bengaluru, Karnataka.
            </P>

            <SectionHeading>12. Amendments</SectionHeading>
            <P>
              Zer0 Pro may update this Policy to reflect changes in law or operations. Material changes will be
              communicated to registered participants and parents by email or platform notification. Continued
              participation following that notice constitutes acceptance of the revised Policy.
            </P>
          </section>

          {/* ════════════════════════════════════════════════════
              PART 3 — PARENTAL CONSENT FORM
          ════════════════════════════════════════════════════ */}
          <section id="consent" className="scroll-mt-20 mb-16">
            <div
              className="inline-flex items-center h-7 px-3 rounded-sm font-mono text-[10px] tracking-[0.2em] uppercase border mb-6"
              style={{
                borderColor: 'var(--border-brand)',
                color: 'var(--text-brand)',
                background: 'var(--brand-subtle)',
              }}
            >
              Part 3
            </div>
            <h2
              className="font-display text-3xl md:text-4xl mb-1"
              style={{ color: 'var(--text-1)' }}
            >
              Parental Consent Form
            </h2>
            <p className="font-mono text-xs mb-4" style={{ color: 'var(--text-4)' }}>
              To be completed by the Parent or Guardian of the Student Participant
            </p>
            <P>
              This Parental Consent Form is a mandatory part of the registration process for the Super Builders
              Origins – School Edition programme organised by Zer0 Pro (Tech Zer0 Private Limited). By completing
              this registration and ticking the agreement checkbox, the parent or guardian confirms the following
              consents and authorisations in full:
            </P>

            {[
              {
                letter: 'A',
                title: 'Consent to Participate',
                body: 'I am the legal parent or lawful guardian of the student named in this registration. I consent to my child\'s participation in the Super Builders Origins – School Edition programme, including all workshops, the 24-hour hackathon, mentorship sessions, and Demo Day activities, which are conducted fully online.',
              },
              {
                letter: 'B',
                title: 'Consent to Collection and Use of Personal Data',
                body: 'I consent to Zer0 Pro (Tech Zer0 Private Limited) collecting, processing, storing, and using the personal data of myself and my child as described in Part 2 (Privacy Policy) of this document for all purposes related to the Programme, including registration, delivery, communication, evaluation, prize distribution, and certificate issuance. I understand that all personal data will be handled in accordance with the Digital Personal Data Protection Act, 2023 and applicable Indian law.',
              },
              {
                letter: 'C',
                title: 'Consent to Media and Promotional Use',
                body: 'I consent to Zer0 Pro and its authorised media partners recording, photographing, and using my child\'s name, photograph, video recording, voice recording, project content, and any testimonial provided, for the following purposes:',
                list: [
                  'Social media posts and event promotional content',
                  'Event highlight reels and documentation',
                  'Press releases and media coverage',
                  'Internal reports and presentations',
                  'Future event promotions',
                  'Marketing campaigns',
                ],
                footer: 'I understand that this consent covers the use of such content across digital and print media channels operated by or authorised by Zer0 Pro.',
              },
              {
                letter: 'D',
                title: 'Consent to Data Sharing with Partner Platforms',
                body: 'I consent to Zer0 Pro sharing my child\'s name, grade, city, state, domain of interest, and participation tier with Partner Platforms (such as educational or EdTech companies) engaged for programme delivery, cross-promotion, or educational collaboration, strictly in accordance with the data sharing safeguards described in the Privacy Policy.',
              },
              {
                letter: 'E',
                title: 'Online Safety Acknowledgement',
                body: 'I acknowledge that the Programme is conducted entirely online. I confirm that I have read and understood the online safety guidelines set out in the Terms and Conditions (Part 1) read with the Privacy Policy (Part 2) and that my child will adhere to those guidelines throughout the Programme.',
              },
              {
                letter: 'F',
                title: 'Code of Conduct Acknowledgement',
                body: 'I acknowledge that my child is bound by the Code of Conduct (Part 1) of these Terms and that failure to comply may result in immediate disqualification without refund.',
              },
              {
                letter: 'G',
                title: 'Intellectual Property Acknowledgement',
                body: 'I acknowledge that any work created by my child during the Programme belongs to my child, and that by submitting a project, my child grants Zer0 Pro the limited licence described in Part 1, Clause 8 of these Terms.',
              },
              {
                letter: 'H',
                title: 'Refund and Payment Acknowledgement',
                body: 'I acknowledge and agree to the refund and cancellation policy set out in Part 1, Clause 5 of these Terms, including that no refund will be issued after the Programme commences on 26 May.',
              },
            ].map(({ letter, title, body, list, footer }) => (
              <div key={letter} className="mb-5">
                <SubHeading>{letter}. {title}</SubHeading>
                <P>{body}</P>
                {list && <Ul items={list} />}
                {footer && <P>{footer}</P>}
              </div>
            ))}

          </section>

          {/* ── Back to top + contact ── */}
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 border-t"
            style={{ borderColor: 'var(--border-faint)' }}
          >
            <p className="font-mono text-xs" style={{ color: 'var(--text-4)' }}>
              Questions?{' '}
              <a
                href="mailto:team@0x.day"
                className="underline underline-offset-2 transition-colors"
                style={{ color: 'var(--text-3)' }}
              >
                team@0x.day
              </a>
            </p>
            <a
              href="#"
              className="font-mono text-[10px] tracking-widest uppercase transition-colors"
              style={{ color: 'var(--text-4)' }}
            >
              ↑ Back to top
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </>
  )
}
