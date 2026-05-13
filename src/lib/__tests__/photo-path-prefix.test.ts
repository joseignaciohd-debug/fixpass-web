import { describe, expect, it } from "vitest";

// The service-request action filters submitted photo paths so only
// those that start with the requester's auth.uid() prefix are
// attached. This protects against a crafted POST that includes
// another user's storage path. This test enshrines the rule.

function filterOwnedPaths(paths: string[], authUserId: string): string[] {
  const prefix = `${authUserId}/`;
  return paths.filter((p) => p.startsWith(prefix));
}

describe("filterOwnedPaths", () => {
  const userA = "uid-aaa-bbb";
  const userB = "uid-xxx-yyy";

  it("keeps paths that start with the user's prefix", () => {
    const got = filterOwnedPaths(
      [`${userA}/1.jpg`, `${userA}/sub/2.jpg`],
      userA,
    );
    expect(got).toHaveLength(2);
  });

  it("drops paths owned by other users", () => {
    const got = filterOwnedPaths(
      [`${userA}/1.jpg`, `${userB}/2.jpg`, `${userB}/sub/3.jpg`],
      userA,
    );
    expect(got).toEqual([`${userA}/1.jpg`]);
  });

  it("drops paths without a leading uid", () => {
    const got = filterOwnedPaths(["evil.jpg", `${userA}.jpg`], userA);
    expect(got).toEqual([]);
  });

  it("drops empty array gracefully", () => {
    expect(filterOwnedPaths([], userA)).toEqual([]);
  });
});
