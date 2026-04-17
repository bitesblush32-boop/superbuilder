import { auth } from '@clerk/nextjs/server'
import Razorpay from 'razorpay'
import { getStudentByClerkId } from '@/lib/db/queries/students'
import { createPendingPayment } from '@/lib/db/queries/payments'

const rzp = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Amount map in paise (₹1 = 100 paise)
const AMOUNT_MAP: Record<string, number> = {
  'pro-false':      149900, // ₹1,499
  'premium-false':  249900, // ₹2,499
  'premium-true':    99900, // ₹999 (EMI first instalment)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await getStudentByClerkId(userId)
  if (!student) {
    return Response.json({ error: 'Student record not found' }, { status: 404 })
  }

  let tier: 'pro' | 'premium', isEmi: boolean
  try {
    const body = await req.json()
    tier  = body.tier
    isEmi = !!body.isEmi
    if (tier !== 'pro' && tier !== 'premium') throw new Error('Invalid tier')
    if (tier === 'pro' && isEmi) isEmi = false // EMI only for Premium
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const amount = AMOUNT_MAP[`${tier}-${isEmi}`]
  if (!amount) {
    return Response.json({ error: 'Invalid tier/EMI combination' }, { status: 400 })
  }

  // Create Razorpay order
  const order = await rzp.orders.create({
    amount,
    currency: 'INR',
    receipt:  `sb_${student.id.slice(0, 8)}_${Date.now()}`,
    notes:    { studentId: student.id, tier, isEmi: String(isEmi) },
  })

  // Save pending payment record
  await createPendingPayment({
    studentId:       student.id,
    razorpayOrderId: order.id,
    amount,
    tier,
    isEmi,
  })

  return Response.json({
    orderId: order.id,
    amount:  order.amount,
    keyId:   process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
