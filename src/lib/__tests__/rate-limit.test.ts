import { describe, expect, it } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("allows up to max in the window then rejects", () => {
    const key = `unit:${Math.random()}`;
    const opts = { max: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);
  });

  it("returns accurate remaining counts", () => {
    const key = `unit:${Math.random()}`;
    const opts = { max: 5, windowMs: 60_000 };
    expect(rateLimit(key, opts).remaining).toBe(4);
    expect(rateLimit(key, opts).remaining).toBe(3);
    expect(rateLimit(key, opts).remaining).toBe(2);
  });

  it("scopes by key", () => {
    const opts = { max: 1, windowMs: 60_000 };
    const a = `unit:${Math.random()}:a`;
    const b = `unit:${Math.random()}:b`;
    expect(rateLimit(a, opts).ok).toBe(true);
    expect(rateLimit(a, opts).ok).toBe(false);
    // Different key — its own bucket.
    expect(rateLimit(b, opts).ok).toBe(true);
  });
});
