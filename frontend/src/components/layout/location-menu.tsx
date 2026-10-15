"use client"

import {
  AlertCircleIcon,
  GlobeIcon,
  LocateFixedIcon,
  MapPinIcon,
} from "lucide-react"
import { useId } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useUserLocation } from "@/lib/location/location-provider"

const MAX_LABEL_LENGTH = 120

/**
 * Globe menu in the header: detects the current position (browser
 * geolocation + reverse geocoding) and lets the user correct it by hand.
 * The value only lives in memory for this session.
 */
export function LocationMenu() {
  const { location, isDetecting, error, detect, setManual, clear } =
    useUserLocation()
  const inputId = useId()

  const triggerText = location?.label ?? "Helyzet megadása"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 max-w-56 gap-1.5 rounded-full px-2.5"
          aria-label={
            location
              ? `Helyzet: ${location.label}. Módosítás`
              : "Helyzet megadása"
          }
        >
          {isDetecting ? <Spinner /> : <GlobeIcon className="size-4" aria-hidden />}
          <span className="hidden truncate text-sm font-medium md:inline">
            {triggerText}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 gap-3 p-3">
        <PopoverHeader>
          <PopoverTitle>Helyzeted</PopoverTitle>
          <PopoverDescription>
            Csak erre a munkamenetre jegyezzük meg; újratöltéskor elvész.
          </PopoverDescription>
        </PopoverHeader>

        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm">
          <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {location ? (
            <div className="min-w-0">
              <p className="font-medium break-words">{location.label}</p>
              <p className="text-xs text-muted-foreground">
                {location.source === "detected"
                  ? `Automatikusan észlelve${
                      location.coordinates
                        ? ` (±${location.coordinates.accuracyMeters} m)`
                        : ""
                    }`
                  : "Kézzel megadva"}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Még nincs megadva.</p>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => void detect()}
          disabled={isDetecting}
        >
          {isDetecting ? <Spinner /> : <LocateFixedIcon />}
          {isDetecting ? "Helymeghatározás…" : "Jelenlegi helyzetem lekérdezése"}
        </Button>

        {error && (
          <p role="alert" className="flex gap-2 text-sm text-destructive">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <Separator />

        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setManual(String(new FormData(event.currentTarget).get("label") ?? ""))
          }}
        >
          <Label htmlFor={inputId}>
            {location ? "Nem pontos? Pontosítsd:" : "Vagy add meg kézzel:"}
          </Label>
          <div className="flex gap-2">
            <Input
              // Re-mount with the latest address after a detection.
              key={location?.label ?? "empty"}
              id={inputId}
              name="label"
              defaultValue={location?.label}
              maxLength={MAX_LABEL_LENGTH}
              placeholder="pl. Király utca 12, Budapest"
              autoComplete="street-address"
              required
            />
            <Button type="submit">Mentés</Button>
          </div>
        </form>

        {location && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-muted-foreground"
            onClick={clear}
          >
            Helyzet törlése
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
