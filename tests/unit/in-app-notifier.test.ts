import { describe, it, expect, vi } from "vitest";
import { InAppNotifier } from "@/lib/patterns/events/in-app-notifier";

function setup() {
  const notifications = { create: vi.fn().mockResolvedValue(undefined), listForUser: vi.fn() };
  return { notifications, notifier: new InAppNotifier(notifications) };
}

describe("InAppNotifier", () => {
  it("writes one notification when a recharge is approved", async () => {
    const { notifications, notifier } = setup();

    await notifier.handle({ type: "RechargeApproved", userId: 7, amount: 50000 });

    expect(notifications.create).toHaveBeenCalledTimes(1);
    expect(notifications.create).toHaveBeenCalledWith(
      7,
      "Your recharge of Tk 500.00 was approved",
    );
  });

  it("writes a notification for rejected recharge, money received and low balance", async () => {
    const { notifications, notifier } = setup();

    await notifier.handle({ type: "RechargeRejected", userId: 7, amount: 50000 });
    await notifier.handle({ type: "MoneyReceived", userId: 7, amount: 10000, fromName: "Student Two" });
    await notifier.handle({ type: "LowBalance", userId: 7, balance: 7000 });

    expect(notifications.create).toHaveBeenNthCalledWith(
      1,
      7,
      "Your recharge of Tk 500.00 was rejected",
    );
    expect(notifications.create).toHaveBeenNthCalledWith(
      2,
      7,
      "You received Tk 100.00 from Student Two",
    );
    expect(notifications.create).toHaveBeenNthCalledWith(3, 7, "Low balance: Tk 70.00 left");
  });
});
