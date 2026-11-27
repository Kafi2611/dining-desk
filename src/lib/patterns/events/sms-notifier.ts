// Pattern: Observer (behavioral).
// GoF role: SmsNotifier is a ConcreteObserver. It is fake: it only logs, no real SMS is sent.
import type { DiningEvent } from "@/lib/patterns/events/events";
import type { Listener } from "@/lib/patterns/events/listener";
import { describeEvent } from "@/lib/patterns/events/in-app-notifier";

export class SmsNotifier implements Listener {
  constructor(private readonly log: (line: string) => void = console.log) {}

  handle(event: DiningEvent): void {
    this.log(`[SMS fake] to user ${event.userId}: ${describeEvent(event)}`);
  }
}
