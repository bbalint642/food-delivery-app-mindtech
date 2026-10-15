import { useId, useLayoutEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const DURATION = 450;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
/** Slight overshoot so the knob settles like a physical switch. */
const KNOB_EASE = "cubic-bezier(0.5, 0, 0.25, 1.2)";

type Mode = "day" | "night";
type Frame = Keyframe & { transform?: string; opacity?: number };

interface LayerSpec {
  day: Frame;
  night: Frame;
  /** Optional keyframe at the half-way point, used for both directions. */
  mid?: Frame;
  easing?: string;
  /** Delay when animating towards this mode, in ms. */
  delay?: Partial<Record<Mode, number>>;
}

// Each layer has a resting style per mode. The resting style is applied
// inline; a mode change plays a keyframe animation between the two. We use
// the Web Animations API instead of CSS transitions because next-themes
// (`disableTransitionOnChange`) suppresses transitions during the switch.
const LAYERS = {
  night: { day: { opacity: 0 }, night: { opacity: 1 } },
  knob: {
    day: { transform: "translateX(0px) scale(1, 1)" },
    night: { transform: "translateX(72px) scale(1, 1)" },
    // Stretch while travelling.
    mid: { transform: "translateX(36px) scale(1.15, 0.92)" },
    easing: KNOB_EASE,
  },
  sun: {
    day: { opacity: 1, transform: "rotate(0deg) scale(1)" },
    night: { opacity: 0, transform: "rotate(-90deg) scale(0.4)" },
    delay: { day: 120 },
  },
  moon: {
    day: { opacity: 0, transform: "rotate(90deg) scale(0.4)" },
    night: { opacity: 1, transform: "rotate(0deg) scale(1)" },
    delay: { night: 120 },
  },
} satisfies Record<string, LayerSpec>;

type LayerName = keyof typeof LAYERS;

/** Five-pointed star centred on (x, y). */
function star(x: number, y: number, r: number) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? r : r * 0.45;
    return `${(x + radius * Math.cos(a)).toFixed(2)},${(y + radius * Math.sin(a)).toFixed(2)}`;
  });
  return points.join(" ");
}

const SUN = { cx: 100, cy: 30 };
const MOON = { cx: 38, cy: 30 };
const RAYS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/**
 * Pill switch: brand colour with a sun by day, black with a moon by night. Purely
 * decorative — the surrounding button carries the semantics.
 */
export function ThemeSwitchArt({
  isDark,
  className,
}: {
  isDark: boolean;
  className?: string;
}) {
  const id = useId();
  const mode: Mode = isDark ? "night" : "day";
  const prevMode = useRef(mode);
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const from = prevMode.current;
    prevMode.current = mode;
    if (from === mode) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const animations = (Object.keys(LAYERS) as LayerName[]).flatMap((name) => {
      const el = svgRef.current?.querySelector(`[data-layer="${name}"]`);
      if (!el) return [];
      const spec: LayerSpec = LAYERS[name];
      const frames = spec.mid
        ? [spec[from], { ...spec.mid, offset: 0.5 }, spec[mode]]
        : [spec[from], spec[mode]];
      return el.animate(frames, {
        duration: DURATION,
        easing: spec.easing ?? EASE,
        delay: spec.delay?.[mode] ?? 0,
        fill: "backwards",
      });
    });
    return () => animations.forEach((a) => a.cancel());
  }, [mode]);

  const layer = (name: LayerName) => ({
    "data-layer": name,
    style: LAYERS[name][mode] as React.CSSProperties,
  });

  const crescent = `${id}-crescent`;
  const shadow = `${id}-shadow`;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 136 60"
      aria-hidden
      className={cn("block size-full", className)}
    >
      <defs>
        <mask id={crescent}>
          <circle cx={MOON.cx} cy={MOON.cy + 2} r="11" fill="#fff" />
          <circle cx={MOON.cx + 6} cy={MOON.cy - 4} r="9.5" fill="#000" />
        </mask>
        <filter id={shadow} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Track */}
      <rect width="136" height="60" className="fill-primary" />
      <rect width="136" height="60" fill="#0a0a0a" {...layer("night")} />

      {/* Sun */}
      <g
        {...layer("sun")}
        className="origin-[100px_30px]"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
      >
        <circle cx={SUN.cx} cy={SUN.cy} r="7.5" strokeWidth="3" />
        {RAYS.map((a) => (
          <line
            key={a}
            x1={SUN.cx + 12 * Math.cos(a)}
            y1={SUN.cy + 12 * Math.sin(a)}
            x2={SUN.cx + 16.5 * Math.cos(a)}
            y2={SUN.cy + 16.5 * Math.sin(a)}
            strokeWidth="2.2"
          />
        ))}
      </g>

      {/* Moon and stars */}
      <g {...layer("moon")} className="origin-[38px_30px]" fill="#fff">
        <rect
          x={MOON.cx - 12}
          y={MOON.cy - 10}
          width="24"
          height="24"
          mask={`url(#${crescent})`}
        />
        <polygon points={star(MOON.cx - 7, MOON.cy - 12, 3.2)} />
        <polygon points={star(MOON.cx + 4, MOON.cy - 15, 2.6)} />
        <polygon points={star(MOON.cx - 13, MOON.cy - 6, 2.4)} />
      </g>

      {/* Knob */}
      <g filter={`url(#${shadow})`}>
        <circle
          {...layer("knob")}
          className="origin-[32px_30px]"
          cx="32"
          cy="30"
          r="24"
          fill="#fff"
        />
      </g>
    </svg>
  );
}
