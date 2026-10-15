import type { ReactNode } from "react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <BlurFade delay={0.1} className="w-full">
      <Card className="relative overflow-hidden shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          {footer}
        </CardFooter>
        <BorderBeam
          size={120}
          duration={8}
          colorFrom="var(--color-primary)"
          colorTo="oklch(0.828 0.189 84.429)"
        />
      </Card>
    </BlurFade>
  )
}
