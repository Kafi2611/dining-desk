import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@/lib/patterns/events/event-bus";

const approved = { type: "RechargeApproved", userId: 1, amount: 50000 } as const;

describe("EventBus", () => {
  it("sends an event to every listener subscribed to that event type", async () => {
    const bus = new EventBus();
    const a = { handle: vi.fn() };
    const b = { handle: vi.fn() };
    bus.subscribe("RechargeApproved", a);
    bus.subscribe("RechargeApproved", b);

    await bus.publish(approved);

    expect(a.handle).toHaveBeenCalledTimes(1);
    expect(a.handle).toHaveBeenCalledWith(approved);
    expect(b.handle).toHaveBeenCalledTimes(1);
  });

  it("does not call listeners subscribed to a different event type", async () => {
    const bus = new EventBus();
    const other = { handle: vi.fn() };
    bus.subscribe("RechargeRejected", other);

    await bus.publish(approved);

    expect(other.handle).not.toHaveBeenCalled();
  });
});
