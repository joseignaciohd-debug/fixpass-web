import { describe, expect, it } from "vitest";
import { allowanceForCode, computeUsage, monthlyPeriod } from "@/lib/repositories/visits";

// The visit-allowance reset is anchored to the subscription START DAY, not
// the calendar 1st: paid Jun 10 => resets Jul 10, Aug 10, ... These tests
// pin that behaviour plus the usage math so it can't silently drift.

describe("monthlyPeriod (subscription-anchored reset)", () => {
  const anchor = new Date("2026-06-10T14:00:00Z");

  it("first window starts at the anchor", () => {
    const { start, end } = monthlyPeriod(anchor, new Date("2026-06-20T00:00:00Z"));
    expect(start.toISOString()).toBe("2026-06-10T14:00:00.000Z");
    expect(end.toISOString()).toBe("2026-07-10T14:00:00.000Z");
  });

  it("rolls to the next monthly anniversary, not the 1st", () => {
    const { start, end } = monthlyPeriod(anchor, new Date("2026-07-15T00:00:00Z"));
    expect(start.toISOString()).toBe("2026-07-10T14:00:00.000Z");
    expect(end.toISOString()).toBe("2026-08-10T14:00:00.000Z");
  });

  it("a day before the anniversary still counts the previous window", () => {
    const { start, end } = monthlyPeriod(anchor, new Date("2026-07-09T00:00:00Z"));
    expect(start.toISOString()).toBe("2026-06-10T14:00:00.000Z");
    expect(end.toISOString()).toBe("2026-07-10T14:00:00.000Z");
  });

  it("clamps the window end for short months (Jan 31 anchor -> Feb 28)", () => {
    const jan31 = new Date("2026-01-31T00:00:00Z");
    const { start, end } = monthlyPeriod(jan31, new Date("2026-02-15T00:00:00Z"));
    expect(start.toISOString()).toBe("2026-01-31T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });

  it("clamps the window start when the anniversary lands in a short month", () => {
    const jan31 = new Date("2026-01-31T00:00:00Z");
    const { start, end } = monthlyPeriod(jan31, new Date("2026-03-01T00:00:00Z"));
    expect(start.toISOString()).toBe("2026-02-28T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-03-31T00:00:00.000Z");
  });

  it("handles a now before the anchor (future-dated period start)", () => {
    const { start } = monthlyPeriod(anchor, new Date("2026-06-01T00:00:00Z"));
    expect(start.toISOString()).toBe("2026-06-10T14:00:00.000Z");
  });
});

describe("allowanceForCode", () => {
  it("maps plan codes to the site-data monthly allowance", () => {
    expect(allowanceForCode("silver")).toEqual({ included: 1, unlimited: false });
    expect(allowanceForCode("gold")).toEqual({ included: 3, unlimited: false });
    expect(allowanceForCode("platinum")).toEqual({ included: 5, unlimited: false });
  });

  it("fails open for unknown/null codes (never wrongly blocks)", () => {
    expect(allowanceForCode("mystery")).toEqual({ included: null, unlimited: true });
    expect(allowanceForCode(null)).toEqual({ included: null, unlimited: true });
  });
});

describe("computeUsage", () => {
  it("counts completed + in-flight against the allowance", () => {
    const r = computeUsage({ included: 3, unlimited: false, openCount: 1, completedThisPeriod: 1 });
    expect(r).toEqual({ used: 2, remaining: 1, outOfVisits: false });
  });

  it("flags out-of-visits when used meets the allowance", () => {
    const r = computeUsage({ included: 1, unlimited: false, openCount: 1, completedThisPeriod: 0 });
    expect(r).toEqual({ used: 1, remaining: 0, outOfVisits: true });
  });

  it("never returns negative remaining", () => {
    const r = computeUsage({ included: 1, unlimited: false, openCount: 2, completedThisPeriod: 1 });
    expect(r.remaining).toBe(0);
    expect(r.outOfVisits).toBe(true);
  });

  it("treats unlimited/unknown as never out of visits", () => {
    const r = computeUsage({ included: null, unlimited: true, openCount: 9, completedThisPeriod: 9 });
    expect(r.remaining).toBe("Unlimited");
    expect(r.outOfVisits).toBe(false);
  });
});
