// Marketing layout — wraps all public-facing marketing pages
// Applied to: landing page (app/page.tsx lives here conceptually)
// Provides: Navbar + Footer shell, ISR-compatible (no auth dependency)

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
