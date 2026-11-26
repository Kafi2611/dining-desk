import { describe, it, expect, vi, afterEach } from "vitest";
import { dhakaDayRange } from "@/lib/services/dhaka-time";

afterEach(() => vi.useRealTimers());

describe("dhakaDayRange", () => {
  it("returns the Asia/Dhaka day that contains now", () => {
    vi.useFakeTimers();
    // 20:00 UTC on Nov 26 is 02:00 on Nov 27 in Dhaka (UTC+6).
    vi.setSystemTime(new Date("2026-11-26T20:00:00Z"));

    const { start, end } = dhakaDayRange(new Date());

    expect(start.toISOString()).toBe("2026-11-26T18:00:00.000Z");
    expect(end.toISOString()).toBe("2026-11-27T18:00:00.000Z");
  });
});
