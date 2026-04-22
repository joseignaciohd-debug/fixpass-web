// FixpassMark / FixpassWordmark — brand lockups.
//
// The approved artwork lives in /public/brand/ as PNG (with a 2x @2x
// variant for retina) and SVG fallbacks. This component is a thin
// wrapper around <Image> so every usage on the site picks up the
// real logo, not a hand-traced approximation.
//
// onDark: when true, we render the white/knockout variant so the mark
// stays legible on navy hero cards. Falls back to the dark mark if the
// white asset isn't present.

import Image from "next/image";

type Props = {
  size?: number;
  // Accepted for API compatibility with the old SVG component but no
  // longer honored — the PNG has a baked-in color. Pass onDark where
  // you used to override color.
  color?: string;
  strokeWidth?: number;
  className?: string;
  onDark?: boolean;
};

export function FixpassMark({ size = 32, className, onDark = false }: Props) {
  // Single source asset. On dark surfaces we render it through a CSS
  // filter instead of shipping a separate knockout PNG — the mark is
  // monochrome on transparent, so `brightness(0) invert(1)` forces
  // every opaque pixel to pure white while preserving anti-aliasing
  // and the alpha channel. Saves a network request + keeps the brand
  // asset count to one.
  const whiteFilter = onDark ? { filter: "brightness(0) invert(1)" } : undefined;
  return (
    <Image
      src="/brand/fixpass-mark.png"
      alt=""
      width={size}
      height={size}
      priority
      sizes={`${size}px`}
      className={className}
      style={whiteFilter}
      aria-hidden
    />
  );
}

export const FIXPASS_TAGLINE = "Home maintenance, handled.";

// FixpassWordmark — house mark + "Fixpass" text lockup. The standalone
// full-logo PNG (/brand/fixpass-logo.png) is reserved for footer + OG
// cards where we want the exact vendor artwork including the tagline;
// the wordmark here is assembled so we can tune size + dark-mode
// independently.
export function FixpassWordmark({
  size = "md",
  showTagline = false,
  onDark = false,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  const sizeMap = { sm: 24, md: 32, lg: 44 } as const;
  const textSize = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];

  const textColor = onDark ? "text-white" : "text-ink";
  const taglineColor = onDark ? "text-white/70" : "text-ink-muted";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <FixpassMark size={sizeMap[size]} onDark={onDark} />
      <div className="flex flex-col leading-none">
        <span
          className={`font-[family-name:var(--font-display)] font-bold tracking-[-0.02em] ${textSize} ${textColor}`}
        >
          Fixpass
        </span>
        {showTagline ? (
          <span className={`mt-1 text-[11px] font-medium ${taglineColor}`}>{FIXPASS_TAGLINE}</span>
        ) : null}
      </div>
    </div>
  );
}
