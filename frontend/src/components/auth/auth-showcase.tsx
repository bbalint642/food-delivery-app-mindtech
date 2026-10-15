import Image from "next/image"
import { FloatingDecor } from "./floating-decor"

/**
 * Leaves and tomatoes arranged along an arc around the platter, clockwise
 * from the top: some sit inside the photo, others spill over the panel
 * edge. The front tomato is slightly blurred for depth of field.
 * Positions are relative to the showcase so they follow the panel size.
 */
const ARC_DECORATIONS = [
  {
    src: "/images/auth/bazsalikom-level.webp",
    size: 104,
    rotate: 35,
    duration: 6.5,
    className: "-top-12 -right-8",
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
    src: "/images/auth/paradicsom.webp",
    size: 100,
    rotate: -10,
    duration: 5.5,
    delay: 0.4,
    className: "-bottom-8 right-[6%]",
  },
  {
    src: "/images/auth/fel-paradicsom.webp",
    size: 76,
    rotate: -18,
    duration: 7,
    delay: 0.8,
    blur: 1.5,
    className: "-bottom-14 left-[34%]",
  },
  {
    src: "/images/auth/bazsalikom-level.webp",
    size: 96,
    rotate: -150,
    duration: 7.5,
    delay: 1.4,
    className: "bottom-[18%] -left-11",
  },
] as const

/**
 * Right-hand side of the auth panel: the salad photo fills the whole area
 * (cropped, never distorted) with the decorations arranged around it.
 */
export function AuthShowcase() {
  return (
    <div className="relative hidden min-h-[520px] md:block">
      {/* Photo clipped to the panel's rounded right corners */}
      <div className="absolute inset-0 overflow-hidden rounded-r-[2rem]">
        <Image
          src="/images/auth/salad.webp"
          alt="A platter of taco salad with avocado, tomatoes, corn and cilantro"
          fill
          priority
          // With object-cover the 3:2 photo is scaled to the panel height
          // (~550px), so it renders ~1.5x wider than the column itself.
          sizes="(min-width: 768px) 840px, 100vw"
          className="object-cover"
        />
      </div>

      {ARC_DECORATIONS.map((decoration, index) => (
        <FloatingDecor key={index} {...decoration} />
      ))}
    </div>
  )
}
