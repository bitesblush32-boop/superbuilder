export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
