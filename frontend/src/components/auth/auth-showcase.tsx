import Image from "next/image"
import { FloatingDecor } from "./floating-decor"

/**
 * Leaves and tomatoes arranged around the platter, clockwise from the top:
 * some sit inside the photo, others spill over the panel edge.
 * Vertical/horizontal positions inside the photo are percentages so they
 * follow the panel size; overflow past the edge is in px.
 */
const ARC_DECORATIONS = [
  {
    // Half tomato peeking over the top edge, left of centre
    src: "/images/auth/fel-paradicsom.webp",
    size: 76,
    rotate: -18,
    duration: 7,
    delay: 0.8,
    className: "-top-[53px] left-[18%]",
  },
  {
    // Orange tomato peeking over the top edge, right of centre
    src: "/images/auth/narancs-paradicsom.webp",
    size: 70,
    rotate: 10,
    duration: 6,
    delay: 1,
    className: "-top-[45px] left-[calc(63%-35px)]",
  },
  {
    // Leaf spilling over the right edge, upper third (mirrored both ways)
    src: "/images/auth/bazsalikom-level.webp",
    size: 104,
    rotate: -25,
    duration: 6.5,
    flipY: true,
    flipX: true,
    className: "top-[24%] -right-[86px]",
  },
  {
    // Whole red tomato spilling over the right edge, near the bottom
    src: "/images/auth/paradicsom.webp",
    size: 100,
    rotate: -10,
    duration: 5.5,
    delay: 0.4,
    className: "bottom-[7%] -right-[66px]",
  },
  {
    // Leaf resting on the photo near the bottom-left
    src: "/images/auth/bazsalikom-level.webp",
    size: 96,
    rotate: -40,
    duration: 7.5,
    delay: 1.4,
    className: "bottom-[4%] left-[22%]",
  },
] as const

/**
 * Where the transparent platter cut-out (882x715) sits inside the
 * 1600x1067 photo, as percentages of the photo. Measured by image
 * registration: scale 1.253, offset (298, 15) px.
 */
const BOWL_IN_PHOTO = { left: "18.63%", top: "1.41%", width: "69.06%" }

/**
 * Right-hand side of the auth panel: the salad photo fills the whole area
 * (cropped, never distorted). On top of it, a cut-out of the same platter
 * is aligned pixel-exactly with the photo but is NOT clipped, so the whole
 * bowl stays visible and spills over the panel edge.
 */
export function AuthShowcase() {
  return (
    <div className="relative hidden min-h-[520px] md:block">
      {/* Photo clipped to the panel's rounded right corners */}
      <div className="absolute inset-0 overflow-hidden rounded-r-[2rem]">
        <Image
          src="/images/auth/salad.webp"
          alt=""
          fill
          priority
          // With object-cover the 3:2 photo is scaled to the panel height
          // (~550px), so it renders ~1.5x wider than the column itself.
          sizes="(min-width: 768px) 840px, 100vw"
          className="object-cover"
        />
      </div>

      {/*
        Unclipped box with the photo's exact object-cover geometry: as tall
        as the column, 3:2 wide, centred. The column is always narrower than
        3:2 (≤ ~560px wide, ≥ 520px tall), so cover scales by height, exactly
        like this box does.
      */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 aspect-[1600/1067] -translate-x-1/2">
        <div
          className="absolute aspect-[882/715] drop-shadow-[0_18px_24px_rgb(0_0_0/0.18)]"
          style={BOWL_IN_PHOTO}
        >
          <Image
            src="/images/auth/salad-bowl.webp"
            alt="A platter of taco salad with avocado, tomatoes, corn and cilantro"
            fill
            priority
            sizes="(min-width: 768px) 600px, 100vw"
          />
        </div>
      </div>

      {ARC_DECORATIONS.map((decoration, index) => (
        <FloatingDecor key={index} {...decoration} />
      ))}
    </div>
  )
}
