import { ORDER_STATUSES, type OrderStatus } from "@/lib/api/types"
import { getToken } from "@/lib/auth/token"
import { API_URL } from "@/lib/config"
import { ApiError } from "./errors"

export interface OrderStatusEvent {
  orderId: string
  status: OrderStatus
  updatedAt: string
}

/**
 * Reads `GET /orders/:id/events` until the server closes the stream or the
 * caller aborts. Each `order.status` event is handed to `onStatus`.
 */
export async function readOrderStatusEvents(
  orderId: string,
  signal: AbortSignal,
  onStatus: (event: OrderStatusEvent) => void,
): Promise<void> {
  const token = getToken()
  if (!token) {
    throw new ApiError(401, ["Missing token"])
  }

  const response = await fetch(
    `${API_URL}/orders/${encodeURIComponent(orderId)}/events`,
    {
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  )

  if (!response.ok || !response.body) {
    throw new ApiError(response.status || 0, ["Order status stream failed"])
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      buffer = takeStatusEvents(buffer, onStatus)
    }
  } finally {
    reader.releaseLock()
  }
}

/** Splits a chunked SSE buffer. Returns the incomplete tail. */
export function takeStatusEvents(
  buffer: string,
  onStatus: (event: OrderStatusEvent) => void,
): string {
  const frames = buffer.split(/\n\n/)
  const rest = frames.pop() ?? ""

  for (const frame of frames) {
    const event = parseStatusFrame(frame)
    if (event) onStatus(event)
  }

  return rest
}

function parseStatusFrame(frame: string): OrderStatusEvent | null {
  let eventName = "message"
  const dataLines: string[] = []

  for (const line of frame.split(/\n/)) {
    if (!line || line.startsWith(":")) continue
    if (line.startsWith("event:")) {
      eventName = fieldValue(line, "event:")
    } else if (line.startsWith("data:")) {
      dataLines.push(fieldValue(line, "data:"))
    }
  }

  if (eventName !== "order.status" || dataLines.length === 0) return null

  try {
    const parsed: unknown = JSON.parse(dataLines.join("\n"))
    if (!isOrderStatusEvent(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

function fieldValue(line: string, name: string): string {
  const raw = line.slice(name.length)
  return raw.startsWith(" ") ? raw.slice(1) : raw
}

function isOrderStatusEvent(value: unknown): value is OrderStatusEvent {
  if (typeof value !== "object" || value === null) return false
  const event = value as Partial<OrderStatusEvent>
  return (
    typeof event.orderId === "string" &&
    typeof event.updatedAt === "string" &&
    typeof event.status === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(event.status)
  )
}
