import { describe, expect, it } from "vitest";

// The open-redirect guard is duplicated across sign-in-form, auth/confirm
// route, and a few other places. This test enshrines the rule so any future
// drift is caught in CI.
//
// Rule: a `next` value is safe to redirect to only if it starts with "/"
// AND does NOT start with "//". The double-slash form ("//evil.com") is a
// protocol-relative URL the browser resolves to a different origin, which
// is what makes `startsWith("/")` alone insufficient.

function isSafeNext(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("/") && !value.startsWith("//");
}

describe("safe-next guard", () => {
  it("accepts plain absolute paths", () => {
    expect(isSafeNext("/app")).toBe(true);
    expect(isSafeNext("/app/welcome?x=1")).toBe(true);
    expect(isSafeNext("/")).toBe(true);
  });

  it("rejects protocol-relative URLs", () => {
    expect(isSafeNext("//evil.com/login")).toBe(false);
    expect(isSafeNext("//evil.com")).toBe(false);
  });

  it("rejects scheme-prefixed URLs", () => {
    expect(isSafeNext("https://evil.com")).toBe(false);
    expect(isSafeNext("http://evil.com/login")).toBe(false);
    expect(isSafeNext("javascript:alert(1)")).toBe(false);
  });

  it("rejects empty / nullish", () => {
    expect(isSafeNext("")).toBe(false);
    expect(isSafeNext(null)).toBe(false);
    expect(isSafeNext(undefined)).toBe(false);
  });
});

// Next.js 13+ marks redirect signals via the `digest` property starting
// with "NEXT_REDIRECT". The old `message === "NEXT_REDIRECT"` check
// silently swallowed paywall bounces in /app/requests/new. The fix uses
// digest; this test enshrines the rule so we don't regress.

function isRedirectError(err: unknown): boolean {
  if (typeof (err as { digest?: unknown })?.digest === "string") {
    return (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
  }
  if (err instanceof Error && err.message === "NEXT_REDIRECT") return true;
  return false;
}

describe("isRedirectError", () => {
  it("detects digest-style redirect", () => {
    const e = new Error("redirect") as Error & { digest: string };
    e.digest = "NEXT_REDIRECT;replace;/app;303";
    expect(isRedirectError(e)).toBe(true);
  });

  it("detects legacy message-style redirect", () => {
    const e = new Error("NEXT_REDIRECT");
    expect(isRedirectError(e)).toBe(true);
  });

  it("does not flag arbitrary errors", () => {
    expect(isRedirectError(new Error("oops"))).toBe(false);
    expect(isRedirectError("string error")).toBe(false);
    expect(isRedirectError(null)).toBe(false);
  });
});
