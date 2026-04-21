// In-memory rate limiter — per-IP sliding window. Good enough for
// protecting form endpoints against dumb bots. For high-scale serious
// protection, swap to Upstash Redis (@upstash/ratelimit).
//
// Caveat: In-memory means each Vercel lambda instance tracks its own
// counter. Attackers with high parallelism can squeeze more through
// than the stated limit, but it still slows them 10x.

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

const CLEANUP_EVERY = 500;
let writesSinceCleanup = 0;

function cleanup(now: number) {
  if (writesSinceCleanup++ < CLEANUP_EVERY) return;
  writesSinceCleanup = 0;
  for (const [k, v] of buckets.entries()) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

/**
 * Consume one token from the bucket keyed by `key`. Returns { ok:false }
 * when the window is full, ok:true otherwise.
 */
export function rateLimit(
  key: string,
  opts: { max: number; windowMs: number },
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  cleanup(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: opts.max - 1, resetAt };
  }

  if (existing.count >= opts.max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { ok: true, remaining: opts.max - existing.count, resetAt: existing.resetAt };
}
