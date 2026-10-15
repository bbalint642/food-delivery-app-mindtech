import Image from "next/image"
import { FloatingDecor } from "./floating-decor"

/**
 * Right-hand side of the auth panel: the salad photo fills the whole area
 * (cropped, never distorted), with a leaf and a tomato spilling over the
 * panel edge.
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

      <FloatingDecor
        src="/images/auth/leaf.svg"
        size={72}
        rotate={-35}
        duration={6}
        className="-right-9 top-[58%]"
      />
      <FloatingDecor
        src="/images/auth/tomato.svg"
        size={88}
        rotate={-12}
        duration={5.5}
        delay={0.4}
        className="-right-6 -bottom-8"
      />
    </div>
  )
}
