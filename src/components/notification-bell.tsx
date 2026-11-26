import { notificationRepository } from "@/lib/container";

// The bell: shows the latest notifications. The number is how many are unread.
export async function NotificationBell({ userId }: { userId: number }) {
  const items = await notificationRepository.listForUser(userId, 10);
  const unread = items.filter((n) => n.readAt === null).length;

  return (
    <details className="relative">
      <summary className="cursor-pointer select-none" aria-label="Notifications">
        🔔 <span data-testid="bell-count">{unread}</span>
      </summary>
      <ul className="absolute right-0 z-10 mt-2 w-72 rounded border bg-white p-2 shadow">
        {items.length === 0 && <li className="text-gray-500">No notifications</li>}
        {items.map((n) => (
          <li key={n.id} className="border-b py-1 last:border-b-0">
            {n.title}
          </li>
        ))}
      </ul>
    </details>
  );
}
