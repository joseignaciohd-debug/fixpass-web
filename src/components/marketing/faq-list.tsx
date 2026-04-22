"use client";

// Interactive FAQ list with live search. Filters the rendered
// question/answer pairs by substring match across the question OR
// answer body. Keeps the JSON-LD (emitted server-side) complete — we
// don't trim the schema even when the UI filters down.

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

type Faq = { q: string; a: string };

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  return (
    <>
      <label className="mb-6 block">
        <span className="sr-only">Search FAQ</span>
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-surface/90 px-4 py-3 shadow-[0_1px_0_0_rgb(var(--shadow)/0.04)] focus-within:border-border-strong focus-within:ring-2 focus-within:ring-royal/30">
          <Search className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions (coverage, scheduling, billing…)"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="rounded-full p-1 text-ink-subtle transition hover:text-ink"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      </label>

      {filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-surface px-5 py-4 transition-colors open:bg-canvas-elevated"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-ink">
                <Highlight text={f.q} query={query} />
                <span className="text-2xl text-ink-subtle transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-ink-muted">
                <Highlight text={f.a} query={query} />
              </p>
            </details>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-canvas-elevated p-8 text-center text-sm text-ink-muted">
          <p>No FAQs match &ldquo;{query}&rdquo;.</p>
          <p className="mt-2">
            Missing something?{" "}
            <a className="link-underline text-royal" href="/contact">
              Ask us directly
            </a>
            .
          </p>
        </div>
      )}
    </>
  );
}

// Wraps matching substrings in a mark so the user sees where their
// query hit. Case-insensitive, preserves original casing in output.
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const lower = text.toLowerCase();
  const needle = q.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let hit = lower.indexOf(needle, i);
  while (hit !== -1) {
    if (hit > i) parts.push(text.slice(i, hit));
    parts.push(
      <mark
        key={`m-${hit}`}
        className="rounded bg-honey-soft px-0.5 text-ink"
      >
        {text.slice(hit, hit + q.length)}
      </mark>,
    );
    i = hit + q.length;
    hit = lower.indexOf(needle, i);
  }
  if (i < text.length) parts.push(text.slice(i));
  return <>{parts}</>;
}
