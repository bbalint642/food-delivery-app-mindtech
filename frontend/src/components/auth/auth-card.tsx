import type { ReactNode } from "react"
import { BlurFade } from "@/components/ui/blur-fade"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

/** Form area of the split auth panel (the panel itself lives in the layout). */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <BlurFade delay={0.1} className="flex w-full max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
      <div className="text-sm text-muted-foreground">{footer}</div>
    </BlurFade>
  )
}
