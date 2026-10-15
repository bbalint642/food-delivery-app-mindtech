"use client"

import { useEffect, useState } from "react"
import { ApiError } from "@/lib/api/errors"
import { readOrderStatusEvents } from "@/lib/api/order-events"
import type { OrderStatus } from "@/lib/api/types"
import { statusIndex } from "@/lib/order-status"

const RETRY_START_MS = 1_000
const RETRY_MAX_MS = 10_000

/**
 * Follows the order's live status. `status` is the furthest step seen on
 * the stream, so a slower initial fetch cannot move the tracker backwards.
 */
export function useOrderStatusStream(orderId: string): {
  status: OrderStatus | null
  live: boolean
} {
  const [trackedOrderId, setTrackedOrderId] = useState(orderId)
  const [status, setStatus] = useState<OrderStatus | null>(null)
  const [live, setLive] = useState(false)

  if (trackedOrderId !== orderId) {
    setTrackedOrderId(orderId)
    setStatus(null)
    setLive(false)
  }

  useEffect(() => {
    const controller = new AbortController()
    let stopped = false
    let delay = RETRY_START_MS

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(resolve, ms)
        controller.signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(timeout)
            reject(new DOMException("Aborted", "AbortError"))
          },
          { once: true },
        )
      })

    const run = async () => {
      while (!stopped) {
        try {
          await readOrderStatusEvents(orderId, controller.signal, (event) => {
            delay = RETRY_START_MS
            setLive(true)
            setStatus((current) =>
              current && statusIndex(event.status) < statusIndex(current)
                ? current
                : event.status,
            )
          })
        } catch (error) {
          if (stopped || isAbort(error)) return
          const httpStatus = ApiError.from(error).status
          if (httpStatus === 400 || httpStatus === 401 || httpStatus === 404) {
            return
          }
        }

        if (stopped) return
        setLive(false)
        try {
          await wait(delay)
        } catch {
          return
        }
        delay = Math.min(delay * 2, RETRY_MAX_MS)
      }
    }

    void run()

    return () => {
      stopped = true
      controller.abort()
    }
  }, [orderId])

  return { status, live }
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError"
}
