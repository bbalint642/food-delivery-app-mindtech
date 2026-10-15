"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface FloatingDecorProps {
  /** Transparent cut-out image. */
  src: string
  /** Width and height of the (square) box; the image is fitted inside it. */
  size: number
  className?: string
  /** Base rotation in degrees. */
  rotate?: number
  /** Seconds per float cycle; vary it so the pieces don't move in lockstep. */
  duration?: number
  delay?: number
  /** Gaussian blur in px, for a depth-of-field "out of focus" look. */
  blur?: number
}

/**
 * A leaf / vegetable that gently floats, typically spilling over the panel.
 * Purely decorative: hidden from assistive tech, static with reduced motion.
 */
export function FloatingDecor({
  src,
  size,
  className,
  rotate = 0,
  duration = 6,
  delay = 0,
  blur = 0,
}: FloatingDecorProps) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-10 drop-shadow-[0_12px_14px_rgb(0_0_0/0.22)]",
        className,
      )}
      style={{ width: size, height: size }}
      initial={{ rotate, y: 0 }}
      animate={
        reducedMotion
          ? { rotate }
          : { y: [0, -12, 0], rotate: [rotate, rotate + 6, rotate] }
      }
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* object-contain keeps non-square cut-outs (e.g. the leaf) undistorted */}
      <Image
        src={src}
        alt=""
        fill
        sizes={`${size * 2}px`}
        className="object-contain"
        style={blur ? { filter: `blur(${blur}px)` } : undefined}
      />
    </motion.div>
  )
}
