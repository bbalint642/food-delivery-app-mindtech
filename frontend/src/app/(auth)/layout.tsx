import type { ReactNode } from "react"
import { AuthShowcase } from "@/components/auth/auth-showcase"
import { FloatingDecor } from "@/components/auth/floating-decor"
import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-orange-50 via-background to-emerald-50 px-4 py-12 dark:from-orange-950/20 dark:via-background dark:to-emerald-950/20">
      <ThemeToggle className="absolute top-4 right-4 z-20" />

      <div className="relative w-full max-w-5xl">
        {/* Decorations that spill outside the card on the left */}
        <FloatingDecor
          src="/images/auth/bazsalikom-level.webp"
          size={110}
          rotate={-35}
          duration={6.5}
          className="-top-12 -left-12 hidden md:block"
        />
        <FloatingDecor
          src="/images/auth/fel-paradicsom.webp"
          size={84}
          rotate={-15}
          duration={7}
          delay={0.6}
          className="-bottom-10 left-[10%] hidden md:block"
        />

        <section className="grid overflow-visible rounded-[2rem] border bg-card shadow-2xl shadow-primary/10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:px-10 md:py-14 lg:px-14">
            <Brand href="/login" />
            {children}
          </div>
          <AuthShowcase />
        </section>
      </div>
    </main>
  )
}
