import Image from "next/image"
import { FloatingDecor } from "./floating-decor"

/**
 * Leaves and tomatoes arranged around the platter, clockwise from the top:
 * some sit inside the photo, others spill over the panel edge. The top
 * tomato is slightly blurred for depth of field.
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
    blur: 1.5,
    className: "-top-[53px] left-[18%]",
  },
  {
    // Leaf spilling over the right edge, upper third
    src: "/images/auth/bazsalikom-level.webp",
    size: 104,
    rotate: 20,
    duration: 6.5,
    className: "top-[24%] -right-[86px]",
  },
  {
    src: "/images/auth/narancs-paradicsom.webp",
    size: 70,
    rotate: 10,
    duration: 6,
    delay: 1,
    className: "top-[42%] -right-10",
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
    rotate: -160,
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

/** Green sauce + spoon cut-out (830x720): scale 0.493, offset (83, 651) px. */
const SAUCE_IN_PHOTO = { left: "5.19%", top: "61.01%", width: "25.56%" }

/**
 * Right-hand side of the auth panel: the salad photo fills the whole area
 * (cropped, never distorted). On top of it, cut-outs of the platter and the
 * sauce bowl are aligned pixel-exactly with the photo but are NOT clipped,
 * so both stay fully visible and spill over the photo's edges.
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
        3:2 (≤ 640px wide, ≥ 520px tall), so cover scales by height, exactly
        like this box does.
        Only from xl up: the cut-outs spill towards the form, and only the
        wide xl panel leaves enough room for them next to the inputs.
      */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden aspect-[1600/1067] -translate-x-1/2 xl:block">
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
        {/* In the photo the sauce bowl sits in front of the platter. */}
        <div
          className="absolute aspect-[830/720] drop-shadow-[0_14px_18px_rgb(0_0_0/0.2)]"
          style={SAUCE_IN_PHOTO}
        >
          <Image
            src="/images/auth/green-sauce.webp"
            alt=""
            fill
            sizes="(min-width: 768px) 240px, 100vw"
          />
        </div>
      </div>

      {ARC_DECORATIONS.map((decoration, index) => (
        <FloatingDecor key={index} {...decoration} />
      ))}
    </div>
  )
}
