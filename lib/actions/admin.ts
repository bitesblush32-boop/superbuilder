'use server'

import { cookies } from 'next/headers'
import { updateAppSetting } from '@/lib/db/queries/teams'

async function verifyAdmin() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session) throw new Error('Not authorized')
}

export async function updateSettingAction(key: string, value: string): Promise<void> {
  await verifyAdmin()
  const parsed = parseFloat(value)
  if (isNaN(parsed) || parsed < 0 || parsed > 100000) throw new Error('Invalid value')
  await updateAppSetting(key, String(Math.floor(parsed)))
}
