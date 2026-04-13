import type { PropsWithChildren } from "react"

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,254,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(254,240,138,0.22),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0.72))]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-3xl border border-white/70 bg-background/80 p-4 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:gap-6 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
