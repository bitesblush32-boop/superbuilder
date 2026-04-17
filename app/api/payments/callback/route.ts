import { type NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { capturePayment, getPaymentByOrderId, confirmStudentPayment } from '@/lib/db/queries/payments'
import { addBadgeToStudent } from '@/lib/db/queries/students'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Razorpay posts to this route after redirect-based payments (net banking, some UPI flows).
// Register https://yourdomain.com/api/payments/callback in the Razorpay dashboard.
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''

  let body: Record<string, string>
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text()
    body = Object.fromEntries(new URLSearchParams(text))
  } else {
    try {
      body = await req.json()
    } catch {
      body = {}
    }
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body

  // Payment failed — Razorpay sends error fields instead of payment fields
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    const reason = encodeURIComponent(
      body['error[reason]'] ?? body['error[description]'] ?? 'Payment was not completed'
    )
    return NextResponse.redirect(`${APP_URL}/register/stage-3/pay?error=${reason}`, { status: 303 })
  }

  // Verify HMAC — Razorpay signs orderId + "|" + paymentId
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.redirect(
      `${APP_URL}/register/stage-3/pay?error=${encodeURIComponent('Payment verification failed. Contact support if money was deducted.')}`,
      { status: 303 }
    )
  }

  const payment = await getPaymentByOrderId(razorpay_order_id)
  if (!payment) {
    return NextResponse.redirect(
      `${APP_URL}/register/stage-3/pay?error=${encodeURIComponent('Payment record not found. Contact support.')}`,
      { status: 303 }
    )
  }

  // Idempotent — webhook may have processed it first
  if (payment.status !== 'captured') {
    await Promise.all([
      capturePayment({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id }),
      confirmStudentPayment({ studentId: payment.studentId, tier: payment.tier }),
    ])
    await addBadgeToStudent(payment.studentId, 'builder', 200)
  }

  return NextResponse.redirect(`${APP_URL}/register/success`, { status: 303 })
}
