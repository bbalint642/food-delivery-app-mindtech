"use client"

import { motion } from "motion/react"
import { ORDER_STATUSES, type OrderStatus } from "@/lib/api/types"
import { ORDER_STATUS_META, statusIndex } from "@/lib/order-status"
import { cn } from "@/lib/utils"

/** Vertical progress of an order through its lifecycle. */
export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = statusIndex(status)

  return (
    <ol className="flex flex-col" aria-label="Order progress">
      {ORDER_STATUSES.map((step, index) => {
        const { label, description, icon: Icon } = ORDER_STATUS_META[step]
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isLast = index === ORDER_STATUSES.length - 1

        return (
          <li
            key={step}
            className="relative flex gap-4 pb-6 last:pb-0"
            aria-current={isCurrent ? "step" : undefined}
          >
            {!isLast && (
              <span className="absolute top-10 bottom-0 left-5 w-0.5 -translate-x-1/2 bg-border">
                <motion.span
                  className="absolute inset-0 origin-top bg-primary"
                  initial={false}
                  animate={{ scaleY: isDone ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </span>
            )}
            <motion.span
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                isDone && "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary/10 text-primary",
                !isDone && !isCurrent && "border-border bg-background text-muted-foreground",
              )}
              initial={false}
              animate={isCurrent ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Icon className="size-5" />
              {isCurrent && (
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary opacity-30 motion-reduce:animate-none" />
              )}
            </motion.span>
            <div className="flex flex-col pt-1.5">
              <span
                className={cn(
                  "font-medium",
                  !isDone && !isCurrent && "text-muted-foreground",
                )}
              >
                {label}
              </span>
              {isCurrent && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  {description}
                </motion.span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
