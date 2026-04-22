import { auth } from '@clerk/nextjs/server'
import Razorpay from 'razorpay'
import { getStudentByClerkId } from '@/lib/db/queries/students'
import { createPendingPayment } from '@/lib/db/queries/payments'
import { getTeamWithMembers, getFlatPricing } from '@/lib/db/queries/teams'
import { redis } from '@/lib/redis'

const MAX_ORDER_ATTEMPTS = 3   // per student per hour

export async function POST() {
  const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
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

  // Redis rate limit — max 3 order creations per student per hour
  const rateKey = `pay:attempts:${student.id}`
  const attempts = await redis.incr(rateKey)
  if (attempts === 1) await redis.expire(rateKey, 3_600) // 1h TTL
  if (attempts > MAX_ORDER_ATTEMPTS) {
    return Response.json(
      { error: 'Too many payment attempts. Please wait an hour before trying again.' },
      { status: 429 },
    )
  }

  const pricing = await getFlatPricing()

  // Flat pricing: solo → price_solo, team of 2-3 → price_team per head
  let memberCount = 1
  if (student.teamId) {
    const teamData = await getTeamWithMembers(student.teamId)
    memberCount = teamData?.memberCount ?? 1
  }

  const priceRupees = memberCount >= 2 ? pricing.priceTeam : pricing.priceSolo
  const amount = priceRupees * 100 // convert to paise

  const order = await rzp.orders.create({
    amount,
    currency: 'INR',
    receipt: `sb_${student.id.slice(0, 8)}_${Date.now()}`,
    notes: { studentId: student.id, memberCount: String(memberCount) },
  })

  await createPendingPayment({
    studentId: student.id,
    razorpayOrderId: order.id,
    amount,
  })

  return Response.json({
    orderId: order.id,
    amount: order.amount,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
