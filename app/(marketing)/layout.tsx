// Marketing layout — public-facing pages only
// No auth sidebar, no dashboard shell
// ISR-compatible: this layout has no server-side auth dependency

import { GraffitiBackground } from './_components/GraffitiBackground'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <GraffitiBackground />
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}
