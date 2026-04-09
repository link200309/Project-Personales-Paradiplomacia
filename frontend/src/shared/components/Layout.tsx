import type { PropsWithChildren } from "react"

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,#e9f6f6,transparent_35%),radial-gradient(circle_at_bottom_right,#fef6de,transparent_32%)] px-4 py-8 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-2xl border border-border/70 bg-background/90 p-5 shadow-xl backdrop-blur sm:p-8">
        {children}
      </main>
    </div>
  )
}
