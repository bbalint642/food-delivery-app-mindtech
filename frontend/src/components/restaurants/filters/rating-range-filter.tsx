"use client"

import { StarIcon } from "lucide-react"
import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { formatRating } from "@/lib/format"
import {
  normalizeRatingRange,
  RATING_MAX,
  RATING_MIN,
  RATING_STEP,
} from "@/lib/restaurant-filters"

const SCALE_MARKS = Array.from(
  { length: RATING_MAX - RATING_MIN + 1 },
  (_, index) => RATING_MIN + index,
)

interface RatingRangeFilterProps {
  minRating?: number
  maxRating?: number
  onChange: (range: { minRating?: number; maxRating?: number }) => void
}

/**
 * From–to rating slider (0.0–5.0, 0.1 steps). Dragging only updates the
 * local value; the filter is applied when the thumb is released, so a drag
 * does not fire a request per step. Re-mount it (via `key`) when the range
 * changes from outside.
 */
export function RatingRangeFilter({
  minRating = RATING_MIN,
  maxRating = RATING_MAX,
  onChange,
}: RatingRangeFilterProps) {
  const [range, setRange] = useState<[number, number]>([minRating, maxRating])
  const [from, to] = range
  const isFullRange = from === RATING_MIN && to === RATING_MAX

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-sm tabular-nums" aria-live="polite">
        <StarIcon className="size-4 fill-amber-400 text-amber-500" aria-hidden />
        {isFullRange ? (
          <span className="text-muted-foreground">Bármilyen értékelés</span>
        ) : (
          <span className="font-medium">
            {formatRating(from)} – {formatRating(to)}
          </span>
        )}
      </p>

      <Slider
        min={RATING_MIN}
        max={RATING_MAX}
        step={RATING_STEP}
        value={range}
        minStepsBetweenThumbs={0}
        thumbLabels={["Minimum értékelés", "Maximum értékelés"]}
        onValueChange={(value) => setRange([value[0], value[1]])}
        onValueCommit={([min, max]) =>
          onChange({ minRating: undefined, maxRating: undefined, ...normalizeRatingRange(min, max) })
        }
        className="py-1"
      />

      <div
        className="flex justify-between px-px text-xs text-muted-foreground tabular-nums"
        aria-hidden
      >
        {SCALE_MARKS.map((mark) => (
          <span key={mark} className="flex w-0 flex-col items-center gap-0.5">
            <span className="h-1.5 w-px bg-border" />
            {mark}
          </span>
        ))}
      </div>
    </div>
  )
}
