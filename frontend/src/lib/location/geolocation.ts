/**
 * Browser geolocation + reverse geocoding. Nothing here is persisted: the
 * results only live in memory (see LocationProvider).
 */

export interface Coordinates {
  latitude: number
  longitude: number
  /** Radius of uncertainty in metres, as reported by the device. */
  accuracyMeters: number
}

export class LocationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "LocationError"
  }
}

const POSITION_TIMEOUT_MS = 15_000

/** Asks the browser (and the user, on first use) for the current position. */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new LocationError("A böngésző nem támogatja a helymeghatározást."))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: Math.round(coords.accuracy),
        }),
      (error) => reject(new LocationError(geolocationMessage(error))),
      {
        enableHighAccuracy: true,
        timeout: POSITION_TIMEOUT_MS,
        // A fresh position: an old cached one is what we want to avoid.
        maximumAge: 0,
      },
    )
  })
}

function geolocationMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "A helymeghatározás nincs engedélyezve. Engedélyezd a böngészőben, vagy add meg a címet kézzel."
    case error.POSITION_UNAVAILABLE:
      return "A helyzeted most nem határozható meg. Add meg a címet kézzel."
    case error.TIMEOUT:
      return "A helymeghatározás túl sokáig tartott. Próbáld újra."
    default:
      return "A helymeghatározás nem sikerült."
  }
}

interface NominatimAddress {
  road?: string
  pedestrian?: string
  house_number?: string
  suburb?: string
  city_district?: string
  city?: string
  town?: string
  village?: string
  municipality?: string
}

/**
 * Turns coordinates into a short, readable address ("Király utca 12,
 * Budapest") using OpenStreetMap Nominatim. Falls back to the rounded
 * coordinates when the service is unreachable.
 */
export async function reverseGeocode(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse")
  url.search = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
    "accept-language": "hu",
  }).toString()

  try {
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const { address } = (await response.json()) as { address?: NominatimAddress }
    const label = address ? formatAddress(address) : ""
    return label || formatCoordinates(latitude, longitude)
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error
    return formatCoordinates(latitude, longitude)
  }
}

function formatAddress(address: NominatimAddress): string {
  const street = address.road ?? address.pedestrian
  const streetLine = street
    ? [street, address.house_number].filter(Boolean).join(" ")
    : (address.suburb ?? address.city_district)
  const locality =
    address.city ?? address.town ?? address.village ?? address.municipality
  return [streetLine, locality].filter(Boolean).join(", ")
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
}
