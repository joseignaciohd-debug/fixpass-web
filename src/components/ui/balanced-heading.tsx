// BalancedHeading — opts the underlying heading into CSS
// `text-wrap: balance`, which evens out line lengths so a hero like
// "Home maintenance, handled." doesn't leave the last line
// widowed with a single word. Supported everywhere that matters
// (Chromium 114+, Safari 17.4+, Firefox 121+). Falls back to normal
// wrapping on older browsers — no layout break.
//
// Also exposes a `pretty` option mapped to `text-wrap: pretty`, which
// is better for longer multi-line paragraphs (avoids orphans without
// forcing equal line lengths). Use `pretty` on body copy, `balance`
// on headlines.

import { cn } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span";

type Props<T extends Tag> = {
  as?: T;
  /** `balance` (default, for headings) or `pretty` (for body paragraphs). */
  wrap?: "balance" | "pretty";
  className?: string;
  children: React.ReactNode;
};

export function BalancedHeading<T extends Tag = "h1">({
  as,
  wrap = "balance",
  className,
  children,
}: Props<T>) {
  const Tag = (as ?? "h1") as Tag;
  return (
    <Tag
      className={cn(
        wrap === "balance" ? "[text-wrap:balance]" : "[text-wrap:pretty]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
