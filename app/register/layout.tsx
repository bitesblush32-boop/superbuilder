// Registration layout — stage progress bar header + gated shell
// Wraps all /register/* routes. Server component — reads student stage from DB.

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg-base">
      {/* TODO: StageProgress bar — "Step X of 5" */}
      <main className="mx-auto max-w-xl px-4 py-10">{children}</main>
    </div>
  )
}
