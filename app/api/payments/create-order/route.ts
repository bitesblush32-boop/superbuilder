import { auth } from '@clerk/nextjs/server'
import Razorpay from 'razorpay'
import { getStudentByClerkId } from '@/lib/db/queries/students'
import { createPendingPayment } from '@/lib/db/queries/payments'
import { getPricingConfig } from '@/lib/db/queries/config'
import { getTeamWithMembers, getTeamDiscounts } from '@/lib/db/queries/teams'

function applyDiscount(amount: number, pct: number): number {
  return Math.floor(amount * (1 - pct / 100))
}

export async function POST(req: Request) {
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

  const [pricing, teamDiscounts] = await Promise.all([
    getPricingConfig(),
    getTeamDiscounts(),
  ])

  const BASE_AMOUNT_MAP: Record<string, number> = {
    'pro-false':     pricing.pro.priceMin * 100,
    'premium-false': pricing.premium.priceMin * 100,
    'premium-true':  pricing.premium.emiFirst * 100,
  }

  const baseAmount = BASE_AMOUNT_MAP[`${tier}-${isEmi}`]
  if (!baseAmount) {
    return Response.json({ error: 'Invalid tier/EMI combination' }, { status: 400 })
  }

  // Compute team discount server-side — never trust the client
  let discountPct = 0
  if (student.teamId) {
    const teamData = await getTeamWithMembers(student.teamId)
    const memberCount = teamData?.memberCount ?? 1
    discountPct = memberCount >= 4 ? teamDiscounts.team4
                : memberCount >= 3 ? teamDiscounts.team3
                : 0
  }

  const amount = applyDiscount(baseAmount, discountPct)

  // Create Razorpay order
  const order = await rzp.orders.create({
    amount,
    currency: 'INR',
    receipt:  `sb_${student.id.slice(0, 8)}_${Date.now()}`,
    notes:    { studentId: student.id, tier, isEmi: String(isEmi), discountPct: String(discountPct) },
  })

  // Save pending payment record (amount already discounted)
  await createPendingPayment({
    studentId:       student.id,
    razorpayOrderId: order.id,
    amount,
    tier,
    isEmi,
    discountPct,
  })

  return Response.json({
    orderId: order.id,
    amount:  order.amount,
    keyId:   process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
