import { describe, expect, it } from "vitest";

describe("placeholder", () => {
  it("keeps CI green until real tests arrive", () => {
    expect(1 + 1).toBe(2);
  });
});
