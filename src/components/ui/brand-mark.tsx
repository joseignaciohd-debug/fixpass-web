// FixpassMark — the house + F logo as an inline SVG. Matches the mobile
// app's FixpassMark exactly so wordmarks + favicons stay consistent.
//
// Purely decorative (aria-hidden). Use `size` to scale, `color` for
// the stroke, `strokeWidth` to tune line weight per placement
// (thinner in small icons, thicker in the footer lock-up).

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function FixpassMark({
  size = 32,
  color = "currentColor",
  strokeWidth = 7,
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* House silhouette */}
      <path
        d="M14 38 L40 16 L66 38 L66 62 Q66 66 62 66 L18 66 Q14 66 14 62 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* F glyph inside */}
      <path
        d="M32 36 L48 36 M32 36 L32 56 M32 46 L44 46"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const FIXPASS_TAGLINE = "Home maintenance, handled.";

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

  const markColor = onDark ? "#FFFFFF" : "rgb(var(--ink))";
  const textColor = onDark ? "text-white" : "text-ink";
  const taglineColor = onDark ? "text-white/70" : "text-ink-muted";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <FixpassMark size={sizeMap[size]} color={markColor} strokeWidth={size === "sm" ? 8 : 7} />
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
