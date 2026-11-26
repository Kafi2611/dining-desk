// Pattern: Observer (behavioral).
// GoF role: EventBus is the Subject. Services publish events to it; subscribed Listeners are told.
import type { DiningEvent, DiningEventType } from "@/lib/patterns/events/events";
import type { Listener } from "@/lib/patterns/events/listener";

export class EventBus {
  private readonly listeners = new Map<DiningEventType, Listener[]>();

  subscribe(type: DiningEventType, listener: Listener): void {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }

  async publish(event: DiningEvent): Promise<void> {
    for (const listener of this.listeners.get(event.type) ?? []) {
      await listener.handle(event);
    }
  }
}
