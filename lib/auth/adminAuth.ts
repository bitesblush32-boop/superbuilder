import { cookies } from 'next/headers'

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  return !!(session?.value && session.value.length > 0)
}

export function getAdminSessionFromHeaders(headers: Headers): boolean {
  const cookie = headers.get('cookie') ?? ''
  const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/)
  return !!(match?.[1] && match[1].length > 0)
}
