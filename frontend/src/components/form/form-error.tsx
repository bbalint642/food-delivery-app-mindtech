"use client"

import { AlertCircleIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { Alert, AlertDescription } from "@/components/ui/alert"

/** Form-level error (e.g. failed login) that animates in and out. */
export function FormError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.div
          key="form-error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <Alert variant="destructive" role="alert">
            <AlertCircleIcon />
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
