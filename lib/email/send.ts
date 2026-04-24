// ─────────────────────────────────────────────────────────────────────────────
// sendEmail — typed wrapper around Resend that also logs to comms_log
// Use this for all automated transactional emails.
// ─────────────────────────────────────────────────────────────────────────────
import { resend, FROM_EMAIL } from './resend'
import { db }                 from '@/lib/db'
import { commsLog }           from '@/lib/db/schema'

interface SendOptions {
  to:         string       // recipient email
  subject:    string
  html:       string
  studentId?: string       // optional — for logging
  studentName?: string     // optional — for logging
  template:   string       // e.g. 'application_submitted_student'
}

interface SendResult {
  success: boolean
  id?:     string
  error?:  string
}

export async function sendEmail(opts: SendOptions): Promise<SendResult> {
  const { to, subject, html, studentId, studentName, template } = opts

  try {
    const result = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      [to],
      subject,
      html,
    })

    const logStatus = result.error ? 'failed' : 'sent'

    // Fire-and-forget log — don't await, don't let log failure break the email
    db.insert(commsLog).values({
      studentId:   studentId ?? null,
      studentName: studentName ?? null,
      template,
      recipient:   to,
      channel:     'email',
      status:      logStatus,
      error:       result.error ? JSON.stringify(result.error) : null,
      triggeredBy: 'system',
    }).catch(() => { /* ignore log errors */ })

    if (result.error) {
      return { success: false, error: JSON.stringify(result.error) }
    }

    return { success: true, id: result.data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    db.insert(commsLog).values({
      studentId:   studentId ?? null,
      studentName: studentName ?? null,
      template,
      recipient:   to,
      channel:     'email',
      status:      'failed',
      error:       message,
      triggeredBy: 'system',
    }).catch(() => { /* ignore */ })

    return { success: false, error: message }
  }
}
