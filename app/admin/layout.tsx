// Minimal wrapper — auth check lives in (protected)/layout.tsx
// so /admin/login is NOT redirected when unauthenticated
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
