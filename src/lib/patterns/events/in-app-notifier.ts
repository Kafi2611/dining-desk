// Pattern: Observer (behavioral).
// GoF role: InAppNotifier is a ConcreteObserver. It writes a Notification row (the bell).
import type { DiningEvent } from "@/lib/patterns/events/events";
import type { Listener } from "@/lib/patterns/events/listener";
import type { NotificationRepository } from "@/lib/repositories/notification-repository";
import { formatTaka } from "@/lib/money";

export function describeEvent(event: DiningEvent): string {
  switch (event.type) {
    case "RechargeApproved":
      return `Your recharge of ${formatTaka(event.amount)} was approved`;
    case "RechargeRejected":
      return `Your recharge of ${formatTaka(event.amount)} was rejected`;
    case "MoneyReceived":
      return `You received ${formatTaka(event.amount)} from ${event.fromName}`;
    case "LowBalance":
      return `Low balance: ${formatTaka(event.balance)} left`;
  }
}

export class InAppNotifier implements Listener {
  constructor(private readonly notifications: NotificationRepository) {}

  async handle(event: DiningEvent): Promise<void> {
    await this.notifications.create(event.userId, describeEvent(event));
  }
}
