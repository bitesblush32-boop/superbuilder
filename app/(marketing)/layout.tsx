// Marketing layout — public-facing pages only
// No auth sidebar, no dashboard shell
// ISR-compatible: this layout has no server-side auth dependency

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
