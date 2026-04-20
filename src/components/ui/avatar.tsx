// Avatar — circular, with gradient fallback + initials.
// Used in portal sidebars, testimonial cards, admin watchlists.

import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

const sizes: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
  ring = false,
}: {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const base = cn(
    "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
    sizes[size],
    ring && "ring-2 ring-emerald ring-offset-2 ring-offset-surface",
    className,
  );

  if (src) {
    return (
      <span className={base}>
        <Image src={src} alt={name} fill sizes="56px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={cn(base, "bg-gradient-to-br from-royal via-lapis to-sky text-white")}
      aria-label={name}
    >
      {initials || "?"}
    </span>
  );
}
