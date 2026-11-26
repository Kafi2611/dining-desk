// Pattern: Observer (behavioral).
// GoF role: Listener is the Observer interface. A new channel (email) = 1 new class that implements it.
import type { DiningEvent } from "@/lib/patterns/events/events";

export interface Listener {
  handle(event: DiningEvent): Promise<void> | void;
}
