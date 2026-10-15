import { UtensilsCrossedIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Brand({
  href = "/restaurants",
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <UtensilsCrossedIcon className="size-4" />
      </span>
      <span className="text-lg">Mini Food</span>
    </Link>
  )
}
