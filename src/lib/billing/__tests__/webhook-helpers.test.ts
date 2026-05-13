import { describe, expect, it } from "vitest";
import {
  deriveBillingCycle,
  isTransientError,
  normalizeStripeStatus,
} from "../webhook-helpers";

describe("normalizeStripeStatus", () => {
  it("treats active and trialing as active", () => {
    expect(normalizeStripeStatus("active")).toBe("active");
    expect(normalizeStripeStatus("trialing")).toBe("active");
  });

  it("treats canceled / incomplete_expired as cancelled", () => {
    expect(normalizeStripeStatus("canceled")).toBe("cancelled");
    expect(normalizeStripeStatus("incomplete_expired")).toBe("cancelled");
  });

  it("treats everything else as paused (safest default)", () => {
    expect(normalizeStripeStatus("past_due")).toBe("paused");
    expect(normalizeStripeStatus("incomplete")).toBe("paused");
    expect(normalizeStripeStatus("unpaid")).toBe("paused");
    expect(normalizeStripeStatus("unknown_future_value")).toBe("paused");
  });
});

describe("deriveBillingCycle", () => {
  it("month x 3 -> 3mo", () => {
    expect(deriveBillingCycle({ interval: "month", intervalCount: 3 })).toBe("3mo");
  });

  it("month x 6 -> 6mo", () => {
    expect(deriveBillingCycle({ interval: "month", intervalCount: 6 })).toBe("6mo");
  });

  it("year -> 1yr", () => {
    expect(deriveBillingCycle({ interval: "year", intervalCount: 1 })).toBe("1yr");
    expect(deriveBillingCycle({ interval: "year", intervalCount: 99 })).toBe("1yr");
  });

  it("defaults to 1yr when nothing matches", () => {
    expect(deriveBillingCycle({ interval: "month", intervalCount: 1 })).toBe("1yr");
    expect(deriveBillingCycle({})).toBe("1yr");
  });
});

describe("isTransientError", () => {
  it("flags network-y messages as transient", () => {
    expect(isTransientError(new Error("fetch failed"))).toBe(true);
    expect(isTransientError(new Error("Connection timeout"))).toBe(true);
    expect(isTransientError(new Error("ECONNREFUSED"))).toBe(true);
    expect(isTransientError(new Error("EAI_AGAIN supabase.co"))).toBe(true);
    expect(isTransientError(new Error("Supabase responded with 503"))).toBe(true);
  });

  it("does NOT flag Postgres constraint failures as transient", () => {
    expect(
      isTransientError(new Error('insert or update on table "x" violates foreign key constraint')),
    ).toBe(false);
  });

  it("does NOT flag arbitrary semantic errors", () => {
    expect(isTransientError(new Error("Unknown plan code"))).toBe(false);
    expect(isTransientError(new Error("Missing customer_id"))).toBe(false);
    expect(isTransientError(null)).toBe(false);
    expect(isTransientError(undefined)).toBe(false);
  });
});
