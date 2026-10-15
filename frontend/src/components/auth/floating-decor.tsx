"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface FloatingDecorProps {
  src: string
  size: number
  className?: string
  /** Base rotation in degrees. */
  rotate?: number
  /** Seconds per float cycle; vary it so the pieces don't move in lockstep. */
  duration?: number
  delay?: number
}

/**
 * A leaf / vegetable that gently floats, placed outside the panel bounds.
 * Purely decorative: hidden from assistive tech, static with reduced motion.
 */
export function FloatingDecor({
  src,
  size,
  className,
  rotate = 0,
  duration = 6,
  delay = 0,
}: FloatingDecorProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute drop-shadow-lg", className)}
      style={{ width: size, height: size }}
      initial={{ rotate, y: 0 }}
      animate={
        reducedMotion
          ? { rotate }
          : { y: [0, -14, 0], rotate: [rotate, rotate + 8, rotate] }
      }
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image src={src} alt="" fill unoptimized sizes={`${size}px`} />
    </motion.div>
  )
}
