"use client"

import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import {
  getCurrentPosition,
  LocationError,
  reverseGeocode,
  type Coordinates,
} from "./geolocation"

export interface UserLocation {
  /** Human-readable address shown in the header. */
  label: string
  /** "detected" = from the device, "manual" = typed or corrected by the user. */
  source: "detected" | "manual"
  /** Device coordinates; kept when the user only corrects the label. */
  coordinates?: Coordinates
}

interface LocationContextValue {
  location: UserLocation | null
  isDetecting: boolean
  error: string | null
  /** Asks the device for the position and resolves it to an address. */
  detect: () => Promise<void>
  /** Sets or corrects the address by hand. */
  setManual: (label: string) => void
  clear: () => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

/**
 * Holds the user's location for the current page session only: it lives in
 * React state and is gone after a reload. Nothing is written to storage,
 * cookies or the server.
 */
export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = useRef<AbortController | null>(null)

  const detect = useCallback(async () => {
    pending.current?.abort()
    const controller = new AbortController()
    pending.current = controller

    setIsDetecting(true)
    setError(null)
    try {
      const coordinates = await getCurrentPosition()
      const label = await reverseGeocode(coordinates, controller.signal)
      if (controller.signal.aborted) return
      setLocation({ label, source: "detected", coordinates })
    } catch (caught) {
      if (controller.signal.aborted) return
      setError(
        caught instanceof LocationError
          ? caught.message
          : "A helymeghatározás nem sikerült.",
      )
    } finally {
      if (pending.current === controller) {
        pending.current = null
        setIsDetecting(false)
      }
    }
  }, [])

  const setManual = useCallback((label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    pending.current?.abort()
    setError(null)
    setIsDetecting(false)
    setLocation((current) => ({
      label: trimmed,
      source: "manual",
      coordinates: current?.coordinates,
    }))
  }, [])

  const clear = useCallback(() => {
    pending.current?.abort()
    setIsDetecting(false)
    setError(null)
    setLocation(null)
  }, [])

  const value = useMemo<LocationContextValue>(
    () => ({ location, isDetecting, error, detect, setManual, clear }),
    [location, isDetecting, error, detect, setManual, clear],
  )

  return <LocationContext value={value}>{children}</LocationContext>
}

export function useUserLocation(): LocationContextValue {
  const context = use(LocationContext)
  if (!context) {
    throw new Error("useUserLocation must be used within a LocationProvider")
  }
  return context
}
