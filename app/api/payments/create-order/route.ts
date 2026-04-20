import { auth } from '@clerk/nextjs/server'
import Razorpay from 'razorpay'
import { getStudentByClerkId } from '@/lib/db/queries/students'
import { createPendingPayment } from '@/lib/db/queries/payments'
import { getTeamWithMembers } from '@/lib/db/queries/teams'

// New flat-rate pricing — server-side source of truth
// Solo: ₹3,499 | Team of 2: ₹6,000 | Team of 3: ₹9,000 (exclusive of GST)
const PLAN_PRICES_PAISE: Record<number, number> = {
  1: 3499 * 100,
  2: 6000 * 100,
  3: 9000 * 100,
}

function getPlanLabel(memberCount: number): string {
  if (memberCount === 2) return 'Team of 2'
  if (memberCount >= 3) return 'Team of 3'
  return 'Solo Builder'
}

export async function POST(_req: Request) {
  const rzp = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const student = await getStudentByClerkId(userId)
  if (!student) {
    return Response.json({ error: 'Student record not found' }, { status: 404 })
  }

  // Determine team size server-side — never trust the client for pricing
  let memberCount = 1
  if (student.teamId) {
    const teamData = await getTeamWithMembers(student.teamId)
    memberCount = Math.min(teamData?.memberCount ?? 1, 3) // cap at 3
  }

  const amount = PLAN_PRICES_PAISE[memberCount] ?? PLAN_PRICES_PAISE[1]
  const planLabel = getPlanLabel(memberCount)

  // Create Razorpay order
  const order = await rzp.orders.create({
    amount,
    currency: 'INR',
    receipt:  `sb_${student.id.slice(0, 8)}_${Date.now()}`,
    notes:    { studentId: student.id, planLabel, memberCount: String(memberCount) },
  })

  // Save pending payment record
  await createPendingPayment({
    studentId:       student.id,
    razorpayOrderId: order.id,
    amount,
    tier:        memberCount >= 2 ? 'premium' : 'pro', // kept for DB compat
    isEmi:       false,
    discountPct: 0,
  })

  return Response.json({
    orderId:  order.id,
    amount:   order.amount,
    keyId:    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
