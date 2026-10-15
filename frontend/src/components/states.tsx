import { AlertTriangleIcon, RotateCwIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface StateMessageProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function StateMessage({
  icon,
  title,
  description,
  action,
}: StateMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      {icon && <div className="text-muted-foreground [&_svg]:size-10">{icon}</div>}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <StateMessage
      icon={<AlertTriangleIcon />}
      title="Valami hiba történt"
      description={message}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCwIcon />
            Újra
          </Button>
        )
      }
    />
  )
}
