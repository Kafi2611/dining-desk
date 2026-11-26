// Pattern: Observer (behavioral).
// GoF role: EventBus is the Subject. Services publish events to it; subscribed Listeners are told.
import type { DiningEvent, DiningEventType } from "@/lib/patterns/events/events";
import type { Listener } from "@/lib/patterns/events/listener";

export class EventBus {
  private readonly listeners = new Map<DiningEventType, Listener[]>();

  constructor(
    private readonly onError: (error: unknown) => void = (e) =>
      console.error("Listener failed:", e),
  ) {}

  subscribe(type: DiningEventType, listener: Listener): void {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  // A failing listener is reported but never stops the others or the caller.
  async publish(event: DiningEvent): Promise<void> {
    for (const listener of this.listeners.get(event.type) ?? []) {
      try {
        await listener.handle(event);
      } catch (e) {
        this.onError(e);
      }
    }
  }
}
