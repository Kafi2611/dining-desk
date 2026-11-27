import { describe, it, expect, vi } from "vitest";
import { SmsNotifier } from "@/lib/patterns/events/sms-notifier";

describe("SmsNotifier", () => {
  it("only logs one line per event and sends nothing", async () => {
    const log = vi.fn();
    const notifier = new SmsNotifier(log);
    const handle = vi.spyOn(notifier, "handle");

    await notifier.handle({ type: "LowBalance", userId: 3, balance: 7000 });

    expect(handle).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith("[SMS fake] to user 3: Low balance: Tk 70.00 left");
  });
});
