"use client"

import { motion, useReducedMotion } from "motion/react"
import Image from "next/image"
import { FloatingDecor } from "./floating-decor"

/**
 * Right-hand side of the auth panel: a salad bowl that spills over the
 * panel edge, plus floating leaves and a tomato around the card.
 */
export function AuthShowcase() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="relative hidden min-h-[520px] overflow-visible md:block">
      {/* Gradient backdrop (clipped to the panel) */}
      <div className="absolute inset-0 overflow-hidden md:rounded-r-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-rose-50 to-emerald-50 dark:from-orange-950/40 dark:via-neutral-900 dark:to-emerald-950/30" />
        <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 size-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      {/* Salad bowl, intentionally overflowing the top-right edge */}
      <motion.div
        className="absolute -top-16 -right-24 size-[460px] drop-shadow-2xl lg:-top-20 lg:-right-28 lg:size-[540px]"
        initial={{ opacity: 0, scale: 0.92, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="size-full"
          animate={reducedMotion ? undefined : { rotate: [0, 3, 0, -3, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src="/images/auth/salad-bowl.svg"
            alt="A fresh salad bowl with greens, chickpeas and avocado"
            fill
            priority
            unoptimized
            sizes="520px"
          />
        </motion.div>
      </motion.div>

      <FloatingDecor
        src="/images/auth/leaf.svg"
        size={72}
        rotate={-35}
        duration={6}
        className="-right-9 top-[58%]"
      />
      <FloatingDecor
        src="/images/auth/leaf.svg"
        size={52}
        rotate={120}
        duration={7}
        delay={0.8}
        className="bottom-[14%] left-[12%]"
      />
      <FloatingDecor
        src="/images/auth/tomato.svg"
        size={88}
        rotate={-12}
        duration={5.5}
        delay={0.4}
        className="-right-6 -bottom-8"
      />
      <FloatingDecor
        src="/images/auth/tomato.svg"
        size={48}
        rotate={18}
        duration={6.5}
        delay={1.2}
        className="bottom-[-10px] left-[42%]"
      />
    </div>
  )
}
