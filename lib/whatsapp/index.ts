/**
 * Meta WhatsApp Cloud API sender
 *
 * IMPORTANT: Every template name used below must be pre-approved in
 * Meta Business Manager → WhatsApp Manager → Message Templates.
 * Unapproved templates will return a 400 / error code 132001.
 *
 * Template approval guide:
 *   https://business.facebook.com/wa/manage/message-templates/
 *
 * Pre-approved template names this project expects (create these in Meta BM):
 *   - sb_stage1_incomplete   : "Hi {{1}}, you started your Super Builders application but didn't finish. Complete it at {{2}} before spots run out! 🚀"
 *   - sb_quiz_not_started    : "Hey {{1}}! 🧠 Your AI quiz is waiting. Score 6+ to unlock your spot. Take it now: {{2}}"
 *   - sb_not_paid_d1         : "Hi {{1}}, you're shortlisted for Super Builders! 🎉 Lock in your spot before someone else takes it: {{2}}"
 *   - sb_not_paid_d2         : "{{1}}, only a few spots left in {{2}} 🔥 Secure yours now: {{3}}"
 *   - sb_not_paid_d3         : "{{1}}, hear what other builders are saying 👀 Join them: {{2}}"
 *   - sb_not_paid_d5         : "⚡ {{1}}, your spot expires in 48 hours. Don't lose it: {{2}}"
 *   - sb_not_paid_final      : "🚨 Last chance {{1}} — registration closes May 25. Grab your spot now: {{2}}"
 *   - sb_bulk_announcement   : "Hey {{1}}! {{2}}"
 */

export interface WhatsAppOptions {
  /** Indian mobile number — accepts any format, will be normalised to 91XXXXXXXXXX */
  to:        string
  /** Pre-approved Meta template name */
  template:  string
  /** Ordered substitution values for {{1}}, {{2}}, … in the template body */
  vars?:     string[]
  /** BCP-47 language code — defaults to 'en' */
  langCode?: string
}

/** Normalises any Indian phone number to E.164 without '+' (e.g. 919876543210) */
function normaliseIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length === 12) return digits
  if (digits.length === 10) return `91${digits}`
  return digits // return as-is if unexpected format
}

/**
 * Sends a WhatsApp message via the Meta Cloud API.
 * Returns true on success, false on failure (logs error).
 */
export async function sendWhatsApp({
  to,
  template,
  vars = [],
  langCode = 'en',
}: WhatsAppOptions): Promise<boolean> {
  const phoneId = process.env.META_WHATSAPP_PHONE_ID
  const token   = process.env.META_WHATSAPP_TOKEN

  if (!phoneId || !token) {
    console.warn('[whatsapp] META_WHATSAPP_PHONE_ID or META_WHATSAPP_TOKEN not configured — skipping send')
    return false
  }

  const recipient = normaliseIndianPhone(to)

  const body = {
    messaging_product: 'whatsapp',
    to:                recipient,
    type:              'template',
    template: {
      name:     template,
      language: { code: langCode },
      components: vars.length > 0
        ? [{
            type:       'body',
            parameters: vars.map(text => ({ type: 'text', text })),
          }]
        : [],
    },
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    if (!res.ok) {
      const err = await res.text()
      console.error(`[whatsapp] send failed to ${recipient} (template: ${template}):`, err)
      return false
    }

    return true
  } catch (err) {
    console.error(`[whatsapp] network error sending to ${recipient}:`, err)
    return false
  }
}
