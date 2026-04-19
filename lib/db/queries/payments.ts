import { db } from '@/lib/db'
import { payments, students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export type Payment    = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert

export async function createPendingPayment(data: {
  studentId:       string
  razorpayOrderId: string
  amount:          number
  tier:            'pro' | 'premium'
  isEmi:           boolean
  discountPct?:    number
}): Promise<Payment> {
  const [payment] = await db
    .insert(payments)
    .values({
      studentId:       data.studentId,
      razorpayOrderId: data.razorpayOrderId,
      amount:          data.amount,
      tier:            data.tier,
      status:          'pending',
      isEmi:           data.isEmi,
      discountPct:     data.discountPct ?? 0,
    })
    .returning()
  return payment
}

export async function capturePayment(data: {
  razorpayOrderId:   string
  razorpayPaymentId: string
}): Promise<Payment | null> {
  const [payment] = await db
    .update(payments)
    .set({
      razorpayPaymentId: data.razorpayPaymentId,
      status:            'captured',
      confirmedAt:       new Date(),
    })
    .where(eq(payments.razorpayOrderId, data.razorpayOrderId))
    .returning()
  return payment ?? null
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.razorpayOrderId, orderId))
    .limit(1)
  return payment ?? null
}

export async function confirmStudentPayment(data: {
  studentId: string
  tier:      'pro' | 'premium'
}): Promise<void> {
  await db
    .update(students)
    .set({
      isPaid:       true,
      tier:         data.tier,
      currentStage: '4',
      updatedAt:    new Date(),
    })
    .where(eq(students.id, data.studentId))
}
