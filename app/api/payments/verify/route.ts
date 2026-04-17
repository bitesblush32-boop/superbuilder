import crypto from 'crypto'
import { auth } from '@clerk/nextjs/server'
import { getStudentByClerkId, addBadgeToStudent } from '@/lib/db/queries/students'
import { capturePayment, getPaymentByOrderId, confirmStudentPayment } from '@/lib/db/queries/payments'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string
  try {
    const body   = await req.json()
    razorpay_order_id   = body.razorpay_order_id
    razorpay_payment_id = body.razorpay_payment_id
    razorpay_signature  = body.razorpay_signature
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) throw new Error()
  } catch {
    return Response.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  // 1. Verify HMAC signature — Razorpay signs (orderId + "|" + paymentId)
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return Response.json({ success: false, error: 'Invalid signature' }, { status: 400 })
  }

  // 2. Look up the payment record
  const payment = await getPaymentByOrderId(razorpay_order_id)
  if (!payment) {
    return Response.json({ success: false, error: 'Payment record not found' }, { status: 404 })
  }

  // 3. Idempotency — already captured, return success
  if (payment.status === 'captured') {
    return Response.json({ success: true })
  }

  // 4. Confirm the student
  const student = await getStudentByClerkId(userId)
  if (!student) {
    return Response.json({ success: false, error: 'Student not found' }, { status: 404 })
  }

  // 5. Capture payment + update student in parallel
  await Promise.all([
    capturePayment({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id }),
    confirmStudentPayment({ studentId: payment.studentId, tier: payment.tier }),
  ])

  // 6. Award Builder badge + 200 XP (idempotency: addBadge is append-only, minor dup risk acceptable)
  await addBadgeToStudent(payment.studentId, 'builder', 200)

  return Response.json({ success: true })
}
