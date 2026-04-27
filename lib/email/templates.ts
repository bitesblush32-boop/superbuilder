// ─────────────────────────────────────────────────────────────────────────────
// Email templates — Super Builders × zer0.pro
// Design system: #0A0A0A bg · #FFB800 gold · Bebas Neue display · Exo 2 headings
// All templates return { subject, html }.
// ─────────────────────────────────────────────────────────────────────────────

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.superbuilder.org'

// ── Shared wrapper ────────────────────────────────────────────────────────────

function wrap(body: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Super Builders</title>
  <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #080808; -webkit-text-size-adjust: 100%; }
    a { color: #FFB800; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .preheader { display: none; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; }
    @media only screen and (max-width: 480px) {
      .mob-outer { padding: 20px 10px 40px !important; }
      .mob-card  { padding: 24px 18px 28px !important; }
      .mob-h1    { font-size: 28px !important; }
      .mob-cta a { padding: 14px 20px !important; font-size: 13px !important; display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:'Exo 2',Helvetica,Arial,sans-serif;">

  ${preheader ? `<div class="preheader" style="display:none;font-size:1px;color:#080808;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#080808;min-height:100vh;">
    <tr>
      <td align="center" class="mob-outer" style="padding:32px 16px 48px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">

          <!-- ══ LOGO HEADER ══ -->
          <tr>
            <td style="padding-bottom:28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Logo image — falls back to text wordmark in clients that block images -->
                    <a href="${APP_URL}" style="display:inline-block;text-decoration:none;">
                      <img src="${APP_URL}/logo.png" alt="Super Builders" width="160" height="46"
                           style="display:block;height:46px;width:auto;max-width:160px;border:0;outline:none;" />
                    </a>
                    <div style="margin-top:5px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#484848;font-family:'Exo 2',Helvetica,sans-serif;">
                      by zer0.pro &nbsp;·&nbsp; School Edition S1 &nbsp;·&nbsp; 2026
                    </div>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <a href="${APP_URL}" style="font-size:11px;color:#484848;text-decoration:none;letter-spacing:0.05em;">
                      superbuilder.org
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══ MAIN CARD ══ -->
          <tr>
            <td style="background:#111111;border:1px solid rgba(255,255,255,0.07);border-radius:20px;overflow:hidden;">

              <!-- Gold top bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(90deg,#FFB800,#FFCF40);height:3px;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Body content -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mob-card" style="padding:36px 32px 40px;">
                    ${body}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ══ FOOTER ══ -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#484848;letter-spacing:0.05em;font-family:'Exo 2',Helvetica,sans-serif;">
                Super Builders &nbsp;·&nbsp; zer0.pro &nbsp;·&nbsp; India &nbsp;·&nbsp; 2026
              </p>
              <p style="margin:0;font-size:11px;color:#333333;line-height:1.6;">
                You're receiving this because you (or your child) registered for Super Builders.<br/>
                <a href="${APP_URL}" style="color:#FFB800;">Visit superbuilder.org</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ── Primitive helpers ─────────────────────────────────────────────────────────

function displayH(text: string, size = 40) {
  return `<h1 style="margin:0 0 12px;font-family:'Exo 2',Impact,Helvetica,sans-serif;font-size:${size}px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;color:#FFFFFF;line-height:1.1;">${text}</h1>`
}

function subheading(text: string) {
  return `<h2 style="margin:0 0 8px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#FFB800;">${text}</h2>`
}

function para(text: string, muted = false) {
  return `<p style="margin:0 0 18px;font-family:'Exo 2',Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${muted ? '#606060' : '#B0B0B0'};">${text}</p>`
}

function ctaButton(label: string, href: string) {
  return `
  <table class="mob-cta" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;width:100%;">
    <tr>
      <td style="background:linear-gradient(135deg,#FFB800,#FFCF40);border-radius:12px;box-shadow:0 0 32px rgba(255,184,0,0.25);">
        <a href="${href}" style="display:inline-block;padding:16px 32px;font-family:'Exo 2',Helvetica,sans-serif;font-size:14px;font-weight:900;color:#000000;text-decoration:none;letter-spacing:0.1em;text-transform:uppercase;">
          ${label} →
        </a>
      </td>
    </tr>
  </table>`
}

function divider() {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border-top:1px solid rgba(255,255,255,0.06);font-size:0;line-height:0;">&nbsp;</td></tr></table>`
}

function badge(label: string, color = '#FFB800') {
  return `<div style="display:inline-block;margin-bottom:16px;padding:4px 14px;border-radius:100px;font-family:'Exo 2',Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;background:${color}1A;color:${color};border:1px solid ${color}40;">${label}</div>`
}

function statsTable(rows: [string, string][]): string {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 16px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#606060;border-bottom:1px solid rgba(255,255,255,0.05);">${label}</td>
      <td style="padding:10px 16px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;font-weight:700;color:#FFFFFF;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);">${value}</td>
    </tr>`).join('')
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;margin-bottom:20px;overflow:hidden;">
    <tbody>${rowsHtml}</tbody>
  </table>`
}

function infoBox(content: string, accentColor = '#FFB800') {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
    <tr>
      <td style="background:${accentColor}0D;border:1px solid ${accentColor}30;border-radius:12px;padding:20px;">
        ${content}
      </td>
    </tr>
  </table>`
}

function timelineStep(num: string, label: string, date: string) {
  return `
  <tr>
    <td style="padding:8px 0;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:28px;height:28px;background:#FFB800;border-radius:50%;text-align:center;vertical-align:middle;">
            <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;font-weight:900;color:#000;">${num}</span>
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:14px;font-weight:600;color:#FFFFFF;">${label}</span>
            <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;color:#606060;margin-left:8px;">${date}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

// ── 1. Parent email verification + registration started ───────────────────────

export function parentEmailVerificationTemplate(opts: {
  parentName:  string
  studentName: string
  grade:       string
  city:        string
  magicLink:   string
}): { subject: string; html: string } {
  const { parentName, studentName, grade, city, magicLink } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `Action required: Verify your email for ${firstName}'s Super Builders registration`,
    html: wrap(`
      ${badge('Parent Verification Required', '#60A5FA')}
      ${displayH(`Hi ${parentName.split(' ')[0]}!`)}
      ${para(`<strong style="color:#FFFFFF;">${studentName}</strong> has just registered for <strong style="color:#FFB800;">Super Builders 2026</strong> — India's premier AI hackathon for school students.`)}
      ${para('Please verify your email address to confirm your child\'s participation. One tap, 5 seconds.')}
      ${ctaButton('Verify My Email', magicLink)}
      ${divider()}
      ${subheading('About the Registration')}
      ${statsTable([
        ['Student Name',  studentName],
        ['Grade',         `Class ${grade}`],
        ['City',          city || '—'],
        ['Programme',     'Super Builders — School Edition S1'],
        ['Dates',         'Jun 7–8, 2026 (24-hour hackathon)'],
        ['Mode',          '100% Online'],
      ])}
      ${divider()}
      ${subheading('What Happens Next')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tbody>
          ${timelineStep('1', 'Domain Quiz', 'Online — 10 questions')}
          ${timelineStep('2', 'Idea Submission', 'Problem + AI approach')}
          ${timelineStep('3', 'Payment', '₹3,499 Solo / ₹2,999 per head (Team)')}
          ${timelineStep('4', '3 Live Workshops', 'Jun 3–5, 2026')}
          ${timelineStep('5', '24-Hour Hackathon', 'Jun 7–8, 2026')}
          ${timelineStep('6', 'Demo Day + Certificates', 'Jun 27 / Jul 1, 2026')}
        </tbody>
      </table>
      ${infoBox(`
        <p style="margin:0 0 6px;font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#FFB800;">Safety Note</p>
        <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.6;">All sessions are online, recorded, and supervised. No personal data is shared publicly. Mentors are verified professionals. We maintain a dedicated parent WhatsApp group.</p>
      `)}
      ${para('This verification link expires in <strong style="color:#FFFFFF;">24 hours</strong>. If you did not expect this email, you can safely ignore it.', true)}
    `, `${firstName} registered for Super Builders 2026 — verify your email to confirm participation`),
  }
}

// ── 2. Application submitted — student ───────────────────────────────────────

export function applicationSubmittedStudentTemplate(opts: {
  studentName: string
  grade:       string
  city:        string
  xpTotal:     number
}): { subject: string; html: string } {
  const { studentName, grade, city, xpTotal } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `You're in, ${firstName}! Explorer badge unlocked — Super Builders`,
    html: wrap(`
      ${badge('Explorer Badge Unlocked 🧭', '#A78BFA')}
      ${displayH(`Welcome,\n${firstName}!`)}
      ${para(`Your application is locked in. You just earned your first badge — <strong style="color:#A78BFA;">Explorer 🧭</strong> — and <strong style="color:#FFB800;">+50 XP</strong>!`)}
      ${statsTable([
        ['Grade',         `Class ${grade}`],
        ['City',          city || '—'],
        ['XP Earned',     `${xpTotal} XP`],
        ['Badge Unlocked','Explorer 🧭'],
        ['Current Stage', 'Stage 1 Complete'],
      ])}
      ${divider()}
      ${subheading("What's Next")}
      ${para('Head to your dashboard to select your <strong style="color:#FFFFFF;">hackathon domain</strong> and take the <strong style="color:#FFFFFF;">AI Quiz</strong>. Score 6+ to unlock the AI Curious badge and advance to idea submission.')}
      ${ctaButton('Go to My Dashboard', `${APP_URL}/dashboard`)}
      ${infoBox(`
        <p style="margin:0 0 6px;font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#FFB800;">Prize Pool</p>
        <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:28px;font-weight:900;color:#FFFFFF;">₹1,00,000+</p>
        <p style="margin:4px 0 0;font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;color:#606060;">Jun 7–8, 2026 · 24-hour hackathon · 100% online</p>
      `)}
      ${para('Questions? Reply to this email or find us on Discord.', true)}
    `, `You're registered! Explorer badge unlocked — next: domain quiz`),
  }
}

// ── 3. Application submitted — parent ────────────────────────────────────────

export function applicationSubmittedParentTemplate(opts: {
  parentName:   string
  studentName:  string
  grade:        string
  programmeUrl: string
}): { subject: string; html: string } {
  const { parentName, studentName, grade, programmeUrl } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `${firstName} applied to Super Builders — programme overview for parents`,
    html: wrap(`
      ${displayH(`${firstName} Is In!`, 36)}
      ${para(`Hi ${parentName.split(' ')[0]},`)}
      ${para(`<strong style="color:#FFFFFF;">${studentName}</strong> (Class ${grade}) has submitted their application to <strong style="color:#FFB800;">Super Builders — School Edition 2026</strong> by zer0.pro.`)}
      ${statsTable([
        ['Programme',       'Super Builders School Edition S1'],
        ['Mode',            '100% Online'],
        ['Hackathon Dates', 'Jun 7–8, 2026'],
        ['Prize Pool',      '₹1,00,000+'],
        ['Target Audience', 'Class 8–12 (age 13–18)'],
      ])}
      ${divider()}
      ${subheading('Upcoming Steps (no payment yet)')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tbody>
          ${timelineStep('1', 'Domain Quiz', 'Online — 10 questions')}
          ${timelineStep('2', 'Idea Submission', 'Problem statement + AI approach')}
          ${timelineStep('3', 'Registration Fee', '₹3,499 Solo / ₹2,999 per head (Team)')}
          ${timelineStep('4', '3 Live Workshops', 'Jun 3–5, 2026')}
          ${timelineStep('5', '24-Hour Hackathon', 'Jun 7–8, 2026')}
        </tbody>
      </table>
      ${infoBox(`
        <p style="margin:0 0 8px;font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#FFB800;">Safety First</p>
        <ul style="margin:0;padding-left:20px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:2;">
          <li>100% online — no in-person attendance</li>
          <li>All sessions recorded and supervised</li>
          <li>Mentors are verified professionals</li>
          <li>Dedicated parent WhatsApp group</li>
          <li>No personal data shared publicly</li>
        </ul>
      `)}
      ${ctaButton('View Programme Details', programmeUrl)}
    `, `${firstName} is registered for Super Builders 2026`),
  }
}

// ── 4. Orientation complete — parent ─────────────────────────────────────────

export function orientationCompleteParentTemplate(opts: {
  parentName:  string
  studentName: string
}): { subject: string; html: string } {
  const { parentName, studentName } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `${firstName} completed orientation — domain quiz is next`,
    html: wrap(`
      ${badge('Orientation Complete', '#34D399')}
      ${displayH(`${firstName} Is Moving Fast!`, 36)}
      ${para(`Hi ${parentName.split(' ')[0]},`)}
      ${para(`<strong style="color:#FFFFFF;">${studentName}</strong> just completed their Super Builders orientation — watched the welcome video and reviewed all programme rules.`)}
      ${divider()}
      ${subheading("What's Next for " + firstName)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tbody>
          ${timelineStep('→', 'Choose Domain', 'Health / Education / Finance / Environment / Entertainment / Social Impact')}
          ${timelineStep('→', 'Pass the Quiz', '10 questions · 6/10 to pass · 2 attempts')}
          ${timelineStep('→', 'Submit an Idea', 'Problem statement + AI approach')}
        </tbody>
      </table>
      ${para(`The quiz takes about 15 minutes. ${firstName} has 2 attempts and can choose their topic area — encourage them to pick something they're genuinely excited about.`, true)}
      ${ctaButton('View Dashboard', `${APP_URL}/dashboard`)}
    `, `${firstName} completed orientation — quiz coming up`),
  }
}

// ── 5. Quiz passed — student ──────────────────────────────────────────────────

export function quizPassedStudentTemplate(opts: {
  studentName: string
  score:       number
  domain:      string
  xpTotal:     number
}): { subject: string; html: string } {
  const { studentName, score, domain, xpTotal } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `${score}/10 — Quiz passed! AI Curious badge unlocked — Super Builders`,
    html: wrap(`
      ${badge('AI Curious Badge Unlocked 🧠', '#60A5FA')}
      ${displayH('Quiz Passed!')}
      ${para(`<strong style="color:#FFB800;">${score}/10</strong> on the <strong style="color:#FFFFFF;">${domain}</strong> quiz. You just unlocked the <strong style="color:#60A5FA;">AI Curious 🧠</strong> badge!`)}
      ${statsTable([
        ['Score',         `${score}/10`],
        ['Domain',        domain],
        ['Badge Earned',  'AI Curious 🧠'],
        ['Total XP',      `${xpTotal} XP`],
      ])}
      ${divider()}
      ${subheading("Next: Idea Submission")}
      ${para('Now submit your project idea. Describe the problem you want to solve, who it helps, and how you\'d use AI. Keep it real — rough ideas win hackathons.')}
      ${ctaButton('Submit My Idea', `${APP_URL}/dashboard`)}
    `, `You passed! Score: ${score}/10 — now submit your idea`),
  }
}

// ── 6. Quiz failed — student ──────────────────────────────────────────────────

export function quizFailedStudentTemplate(opts: {
  studentName:  string
  score:        number
  domain:       string
  attemptsLeft: number
}): { subject: string; html: string } {
  const { studentName, score, domain, attemptsLeft } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `Quiz result: ${score}/10 — ${attemptsLeft > 0 ? `${attemptsLeft} attempt left` : 'contact us'}`,
    html: wrap(`
      ${displayH('Keep Going!')}
      ${para(`You scored <strong style="color:#FFB800;">${score}/10</strong> on the <strong style="color:#FFFFFF;">${domain}</strong> quiz. You need 6+ to pass.`)}
      ${attemptsLeft > 0
        ? para(`You have <strong style="color:#FFFFFF;">${attemptsLeft} attempt remaining</strong>. Use the tips below.`)
        : para('You\'ve used both attempts. Our team will review your case — reply to this email.', true)
      }
      ${divider()}
      ${subheading('Tips to Pass')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
        <tbody>
          <tr><td style="padding:6px 0;font-family:'Exo 2',Helvetica,sans-serif;font-size:14px;color:#B0B0B0;">
            <span style="color:#FFB800;margin-right:8px;">→</span> Re-read your domain overview on the dashboard
          </td></tr>
          <tr><td style="padding:6px 0;font-family:'Exo 2',Helvetica,sans-serif;font-size:14px;color:#B0B0B0;">
            <span style="color:#FFB800;margin-right:8px;">→</span> Re-watch the orientation video on domains
          </td></tr>
          <tr><td style="padding:6px 0;font-family:'Exo 2',Helvetica,sans-serif;font-size:14px;color:#B0B0B0;">
            <span style="color:#FFB800;margin-right:8px;">→</span> For short-answer questions — write at least 2 full sentences
          </td></tr>
          <tr><td style="padding:6px 0;font-family:'Exo 2',Helvetica,sans-serif;font-size:14px;color:#B0B0B0;">
            <span style="color:#FFB800;margin-right:8px;">→</span> Ask in Discord — other builders will help!
          </td></tr>
        </tbody>
      </table>
      ${attemptsLeft > 0 ? ctaButton('Retry Quiz', `${APP_URL}/dashboard`) : ''}
      ${para('You\'ve got this, ' + firstName + '.', true)}
    `, `Quiz result: ${score}/10 — ${attemptsLeft > 0 ? 'one more attempt available' : 'both attempts used'}`),
  }
}

// ── 7. Quiz result — parent ───────────────────────────────────────────────────

export function quizResultParentTemplate(opts: {
  parentName:  string
  studentName: string
  score:       number
  domain:      string
  passed:      boolean
}): { subject: string; html: string } {
  const { parentName, studentName, score, domain, passed } = opts
  const firstName = studentName.split(' ')[0]

  return {
    subject: `${firstName}'s quiz result — ${score}/10 — Super Builders`,
    html: wrap(`
      ${badge(passed ? 'Quiz Passed ✓' : 'Quiz Attempt', passed ? '#34D399' : '#FBBF24')}
      ${displayH(`${firstName}'s Quiz Result`, 36)}
      ${para(`Hi ${parentName.split(' ')[0]},`)}
      ${para(`<strong style="color:#FFFFFF;">${studentName}</strong> just completed the <strong style="color:#FFFFFF;">${domain}</strong> domain quiz.`)}
      ${statsTable([
        ['Score',   `${score}/10`],
        ['Result',  passed ? '✓ Passed (6+ required)' : '✗ Did not pass'],
        ['Domain',  domain],
      ])}
      ${passed
        ? para(`${firstName} earned the <strong style="color:#60A5FA;">AI Curious 🧠</strong> badge and is moving to idea submission. You\'re raising a builder!`)
        : para(`${firstName} can retry once more. The quiz is intentionally challenging — encourage them to review the domain materials and try again.`, true)
      }
    `, `${firstName}'s quiz score: ${score}/10`),
  }
}

// ── 8. Idea submitted — student ───────────────────────────────────────────────

export function ideaSubmittedStudentTemplate(opts: {
  studentName:      string
  problemStatement: string
  domain:           string
  xpTotal:          number
}): { subject: string; html: string } {
  const { studentName, problemStatement, domain, xpTotal } = opts
  const firstName = studentName.split(' ')[0]
  const preview = problemStatement.length > 130
    ? problemStatement.slice(0, 127) + '…'
    : problemStatement

  return {
    subject: `Idea locked in! Idea Launcher badge unlocked — Super Builders`,
    html: wrap(`
      ${badge('Idea Launcher Badge Unlocked 💡', '#34D399')}
      ${displayH('Your Idea Is Live!')}
      ${para('You just earned the <strong style="color:#34D399;">Idea Launcher 💡</strong> badge. Your idea is in the system and ready for the hackathon!')}
      ${infoBox(`
        <p style="margin:0 0 4px;font-family:'Exo 2',Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#FFB800;">Your Idea</p>
        <p style="margin:0 0 8px;font-family:'Exo 2',Helvetica,sans-serif;font-size:15px;color:#FFFFFF;line-height:1.6;">${preview}</p>
        <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:11px;color:#FFB800;letter-spacing:0.1em;text-transform:uppercase;">${domain} domain</p>
      `)}
      ${statsTable([
        ['Badge Earned', 'Idea Launcher 💡'],
        ['Total XP',     `${xpTotal} XP`],
        ['Next Step',    'Choose tier & pay'],
      ])}
      ${divider()}
      ${subheading('Final Step — Lock Your Spot')}
      ${para('Register Solo (₹3,499) or as a Team of 2–3 (₹2,999/head) and complete payment to unlock your workshops and hackathon access.')}
      ${ctaButton('Confirm My Spot', `${APP_URL}/dashboard`)}
    `, `Idea locked in — ${firstName} is almost a confirmed builder`),
  }
}

// ── 9. Parent email OTP ───────────────────────────────────────────────────────

export function parentOtpTemplate(opts: {
  parentName:  string
  studentName: string
  otp:         string
}): { subject: string; html: string } {
  const { parentName, studentName, otp } = opts
  const firstName = parentName.split(' ')[0]

  // Render OTP digits as large coloured boxes
  const digitBoxes = otp.split('').map(d =>
    `<td style="padding:0 5px;">
       <div style="width:44px;height:56px;background:#161616;border:2px solid rgba(255,184,0,0.5);border-radius:10px;
                   font-family:'Exo 2',Helvetica,Arial,sans-serif;font-size:28px;font-weight:900;
                   color:#FFB800;text-align:center;line-height:56px;letter-spacing:0;">
         ${d}
       </div>
     </td>`
  ).join('')

  return {
    subject: `${otp} — Your Super Builders verification code`,
    html: wrap(`
      ${displayH('Verify Your Email', 34)}
      ${para(`Hi ${firstName},`)}
      ${para(`<strong style="color:#FFFFFF;">${studentName}</strong> is registering for <strong style="color:#FFB800;">Super Builders — School Edition 2026</strong>. Enter this code in the registration form to confirm your email address:`)}

      <!-- OTP digit boxes -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;">
        <tr>${digitBoxes}</tr>
      </table>

      ${infoBox(`
        <p style="margin:0 0 4px;font-family:'Exo 2',Helvetica,sans-serif;font-size:11px;font-weight:700;
                  letter-spacing:0.15em;text-transform:uppercase;color:#FBBF24;">Important</p>
        <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.7;">
          This code expires in <strong style="color:#FFFFFF;">10 minutes</strong>.<br/>
          If you did not request this, you can safely ignore this email.
        </p>
      `)}
      ${divider()}
      ${para('Once verified, you will be asked to give parental consent for your child to participate in the programme.', true)}
    `, `${otp} is your Super Builders verification code — expires in 10 minutes`),
  }
}

// ── 10. Quiz-passed parent retention — payment nudge (12-hour sequence) ──────
//
// Send attempt 1 immediately after quiz pass, then every 12h.
// attempt: 1 | 2 | 3 | 4 | 5  (stop after 5 — do not spam beyond 48h)
//
// Tone strategy:
//   1 → Celebrate achievement, zero pressure
//   2 → Value/ROI — what the fee actually buys
//   3 → Social proof — peers from same city are confirming
//   4 → Countdown urgency — workshops start Jun 3
//   5 → Final, respectful — won't email again, full refund policy visible

export function quizPassedParentRetentionTemplate(opts: {
  parentName:  string
  studentName: string
  score:       number
  domain:      string
  city:        string
  attempt:     1 | 2 | 3 | 4 | 5
}): { subject: string; html: string } {
  const { parentName, studentName, score, domain, city, attempt } = opts
  const pFirst = parentName.split(' ')[0]
  const sFirst = studentName.split(' ')[0]
  const domainLabel = domain.replace('_', ' ')

  // ── Attempt 1 — Achievement + gentle intro ─────────────────────────────────
  if (attempt === 1) {
    return {
      subject: `${sFirst} scored ${score}/10 on their AI Quiz 🎉 — here's what's next`,
      html: wrap(`
        ${badge('Quiz Passed — AI Curious Badge Earned 🧠', '#60A5FA')}
        ${displayH(`${sFirst} Proved\nThey've Got It!`, 36)}
        ${para(`Hi ${pFirst},`)}
        ${para(`We just wanted to share some great news — <strong style="color:#FFFFFF;">${studentName}</strong> scored <strong style="color:#FFB800;">${score}/10</strong> on the <strong style="color:#FFFFFF;">${domainLabel}</strong> AI Quiz and earned the <strong style="color:#60A5FA;">AI Curious 🧠</strong> badge.`)}
        ${para(`That's not a participation score. That's a real test of AI literacy — and ${sFirst} passed it on their own initiative. You should be proud.`)}
        ${divider()}
        ${subheading("One Step to Unlock Everything")}
        ${infoBox(`
          <p style="margin:0 0 10px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.7;">
            ${sFirst} has completed the quiz and submitted their idea. The only step remaining is payment — which unlocks:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${[
              ['🎓', '3 Live Workshops', 'Jun 3, 4 & 5 — AI tools, domain deep-dive, prototype sprint'],
              ['🧑‍💻', '24-Hour Hackathon', 'Jun 7–8 — build and submit a real AI project'],
              ['📜', 'Verified Certificate', 'Shareable on LinkedIn, backed by zer0.pro'],
              ['🏆', '₹1,00,000+ Prize Pool', 'Top projects win real prizes'],
            ].map(([emoji, title, desc]) => `
              <tr>
                <td style="padding:6px 0;vertical-align:top;width:28px;font-size:16px;">${emoji}</td>
                <td style="padding:6px 0 6px 8px;vertical-align:top;">
                  <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;font-weight:700;color:#FFFFFF;">${title}</span>
                  <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;color:#606060;display:block;margin-top:2px;">${desc}</span>
                </td>
              </tr>`).join('')}
          </table>
        `)}
        ${statsTable([
          ['Registration Fee', '₹3,499 (Solo)  ·  ₹2,999/head (Team of 2–3)'],
          ['Workshops',        'Jun 3, 4 & 5 — 100% online, recorded'],
          ['Hackathon',        'Jun 7–8, 2026 · 24 hours'],
          ['Mode',             'Fully online — no travel required'],
          ['Refund Policy',    'Full refund if we cancel before Jun 3'],
        ])}
        ${ctaButton('Complete Registration', `${APP_URL}/dashboard`)}
        ${para(`No pressure — take your time. If you have any questions, reply to this email or WhatsApp us. We're here.`, true)}
      `, `${sFirst} passed the AI Quiz — one step left to confirm their spot`),
    }
  }

  // ── Attempt 2 — Value / ROI breakdown ─────────────────────────────────────
  if (attempt === 2) {
    return {
      subject: `What ₹3,499 actually buys ${sFirst} — the honest breakdown`,
      html: wrap(`
        ${displayH('The Honest\nBreakdown', 36)}
        ${para(`Hi ${pFirst},`)}
        ${para(`${sFirst} is still one step away from confirming their spot. We thought it might help to break down exactly what the registration fee covers.`)}
        ${divider()}
        ${subheading('What ₹3,499 Gets You')}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tbody>
            ${[
              ['3 Live Workshops (Jun 3–5)', 'Taught by working AI engineers. 90-min sessions, recorded, with Q&A.', '#FFB800'],
              ['24-Hour Hackathon (Jun 7–8)', 'A real build challenge — not a school project. Ships something people can use.', '#60A5FA'],
              ['Mentorship Access', 'Direct access to mentors during the hackathon window.', '#34D399'],
              ['Verified Certificate', 'zer0.pro-backed, shareable on LinkedIn. Colleges notice this.', '#A78BFA'],
              ['₹1,00,000+ Prize Pool', 'Top projects win real prize money — not vouchers.', '#FB923C'],
              ['Discord Community', 'A permanent network of 2,000+ young builders.', '#E879F9'],
            ].map(([title, desc, color]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0 0 3px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;font-weight:700;color:${color};">${title}</p>
                  <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;color:#606060;line-height:1.6;">${desc}</p>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
        ${infoBox(`
          <p style="margin:0 0 4px;font-family:'Exo 2',Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#FFB800;">For context</p>
          <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.7;">
            A single coding coaching session in most cities costs ₹800–₹1,500. ${sFirst} gets 3 expert-led workshops, a hackathon, mentorship, a certificate, and a real project in their portfolio — for less than two months of tuition.
          </p>
        `)}
        ${ctaButton('Confirm Their Spot', `${APP_URL}/dashboard`)}
        ${para(`Team discount: if ${sFirst} registers with 2–3 friends, it's just ₹2,999/head. They can create or join a team from the dashboard.`, true)}
      `, `The honest breakdown of what ${sFirst}'s registration covers`),
    }
  }

  // ── Attempt 3 — Social proof + city traction ───────────────────────────────
  if (attempt === 3) {
    const cityLabel = city || 'across India'
    return {
      subject: `Students from ${cityLabel} are confirming their spots — ${sFirst}'s is still open`,
      html: wrap(`
        ${badge('Spots Filling Up', '#FB923C')}
        ${displayH(`${sFirst}'s Spot\nIs Still Open`, 36)}
        ${para(`Hi ${pFirst},`)}
        ${para(`We're seeing a big wave of confirmations from students${city ? ` in <strong style="color:#FFFFFF;">${city}</strong>` : ' across India'} right now. ${sFirst}'s quiz result and idea are already in the system — they just need payment to lock in.`)}
        ${divider()}
        ${subheading("Why This Matters")}
        ${infoBox(`
          <p style="margin:0 0 10px;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.7;">
            Hackathon teams are formed from confirmed participants. The earlier ${sFirst} confirms, the more time they have to find teammates, plan their project, and attend all 3 workshops before Jun 7.
          </p>
          <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.7;">
            Students who attend all 3 workshops <strong style="color:#FFFFFF;">consistently rank higher</strong> in judging — and the workshops start <strong style="color:#FFB800;">Jun 3</strong>.
          </p>
        `, '#FB923C')}
        ${statsTable([
          ['Quiz Score',     `${score}/10 ✓ (${sFirst} is ready)`],
          ['Domain',         domainLabel],
          ['Workshops',      'Jun 3, 4 & 5 — confirms access'],
          ['Hackathon',      'Jun 7–8, 2026'],
          ['Registration',   '₹3,499 Solo  ·  ₹2,999/head (Team)'],
          ['Deadline',       'May 30, 2026'],
        ])}
        ${ctaButton('Lock In Their Spot', `${APP_URL}/dashboard`)}
        ${para(`Safe and secure — all payments via Razorpay. Full refund if we cancel before Jun 3.`, true)}
      `, `${sFirst}'s spot is still available — confirm before it fills`),
    }
  }

  // ── Attempt 4 — Countdown urgency (workshops near) ────────────────────────
  if (attempt === 4) {
    return {
      subject: `Workshops start Jun 3 — ${sFirst} needs to be in before then`,
      html: wrap(`
        ${badge('Workshops Start Jun 3', '#FBBF24')}
        ${displayH('Time Is\nRunning Out', 36)}
        ${para(`Hi ${pFirst},`)}
        ${para(`The 3 Super Builders workshops start on <strong style="color:#FFB800;">Jun 3</strong> — that's very soon. Students who haven't confirmed by then will miss Workshop 1 and the head start it gives.`)}
        ${divider()}
        ${subheading('The 3 Workshops — What ${sFirst} Would Miss')}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tbody>
            ${[
              ['Jun 3', 'WS 1 — AI Fundamentals', 'Learn to use AI tools confidently. Essential foundation for the hackathon.'],
              ['Jun 4', 'WS 2 — Domain Deep-Dive', 'Refine the problem statement. Mentors help shape the idea.'],
              ['Jun 5', 'WS 3 — Build Sprint', 'Build the first working prototype. Most teams ship something real here.'],
            ].map(([date, title, desc]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <p style="margin:0 0 2px;">
                    <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:11px;font-weight:700;color:#FFB800;letter-spacing:0.1em;">${date}</span>
                    <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;font-weight:700;color:#FFFFFF;margin-left:8px;">${title}</span>
                  </p>
                  <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;color:#606060;line-height:1.6;">${desc}</p>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
        ${infoBox(`
          <p style="margin:0;font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;color:#B0B0B0;line-height:1.7;">
            <strong style="color:#FFFFFF;">${sFirst} already passed the quiz.</strong> Their ${domainLabel} idea is ready. The only thing standing between them and the hackathon is completing payment — which takes 2 minutes.
          </p>
        `, '#FBBF24')}
        ${ctaButton('Complete Payment Now', `${APP_URL}/dashboard`)}
        ${para(`Registration deadline: <strong style="color:#FFFFFF;">May 30, 2026.</strong> Payment via Razorpay — UPI, cards, netbanking all accepted.`, true)}
      `, `Workshops start Jun 3 — ${sFirst} needs to confirm before then`),
    }
  }

  // ── Attempt 5 — Final, respectful, refund prominent ───────────────────────
  return {
    subject: `Our last message about ${sFirst}'s Super Builders spot`,
    html: wrap(`
      ${displayH('One Last\nNote', 36)}
      ${para(`Hi ${pFirst},`)}
      ${para(`We've sent a few emails about ${sFirst}'s Super Builders registration. This is the last one — we don't want to crowd your inbox.`)}
      ${para(`${sFirst} passed the AI Quiz (<strong style="color:#FFB800;">${score}/10</strong>) and submitted their idea. Their spot is still open, but the registration deadline is <strong style="color:#FFFFFF;">May 30</strong>.`)}
      ${divider()}
      ${subheading('If you have concerns, we can help')}
      ${infoBox(`
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
            ['💬', 'WhatsApp us', 'Reply to this email or message us — we respond within the hour.'],
            ['💳', 'Pay in minutes', 'UPI, cards, netbanking — via Razorpay. Takes 2 minutes.'],
            ['🔒', 'Refund policy', 'Full refund if we cancel before Jun 3. No questions asked.'],
            ['👨‍👩‍👧', 'Parent WhatsApp group', 'Join 200+ parents already in our community group.'],
          ].map(([emoji, title, desc]) => `
            <tr>
              <td style="padding:6px 0;vertical-align:top;width:28px;font-size:16px;">${emoji}</td>
              <td style="padding:6px 0 6px 8px;vertical-align:top;">
                <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:13px;font-weight:700;color:#FFFFFF;">${title}</span>
                <span style="font-family:'Exo 2',Helvetica,sans-serif;font-size:12px;color:#606060;display:block;margin-top:2px;">${desc}</span>
              </td>
            </tr>`).join('')}
        </table>
      `)}
      ${ctaButton('Complete Registration', `${APP_URL}/dashboard`)}
      ${para(`If you choose not to proceed, no problem — ${sFirst}'s quiz result and idea will remain on file for future seasons.`, true)}
      ${para(`Wishing ${sFirst} all the best, whatever they decide.`, true)}
    `, `Final note about ${sFirst}'s Super Builders spot — deadline May 30`),
  }
}

// ── 11. Stage progress report — parent (generic) ─────────────────────────────

export function stageProgressParentTemplate(opts: {
  parentName:  string
  studentName: string
  stage:       'quiz' | 'idea' | 'payment'
  details:     Record<string, string>
}): { subject: string; html: string } {
  const { parentName, studentName, stage, details } = opts
  const firstName = studentName.split(' ')[0]

  const stageInfo = {
    quiz:    { label: 'Quiz Complete',    color: '#60A5FA', emoji: '🧠' },
    idea:    { label: 'Idea Submitted',   color: '#34D399', emoji: '💡' },
    payment: { label: 'Payment Complete', color: '#FFB800', emoji: '⚡' },
  }[stage]

  return {
    subject: `Progress update: ${firstName} completed ${stageInfo.label} — Super Builders`,
    html: wrap(`
      ${badge(`${stageInfo.emoji} ${stageInfo.label}`, stageInfo.color)}
      ${displayH('Progress Update', 36)}
      ${para(`Hi ${parentName.split(' ')[0]},`)}
      ${para(`Here's a quick update on <strong style="color:#FFFFFF;">${studentName}</strong>'s Super Builders journey.`)}
      ${statsTable(Object.entries(details) as [string, string][])}
      ${divider()}
      ${para(`${firstName} is making great progress. Keep encouraging them — the hackathon is Jun 7–8 and every step counts.`, true)}
      ${ctaButton('View Dashboard', `${APP_URL}/dashboard`)}
    `, `${firstName} — ${stageInfo.label} on Super Builders`),
  }
}
