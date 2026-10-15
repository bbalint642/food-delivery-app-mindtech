import type { ReactNode } from "react"
import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { DotPattern } from "@/components/ui/dot-pattern"
import { cn } from "@/lib/utils"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
      <DotPattern
        className={cn(
          "-z-10 text-primary/25",
          "[mask-image:radial-gradient(520px_circle_at_center,white,transparent)]",
        )}
      />
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <Brand href="/login" />
        {children}
      </div>
    </main>
  )
}
