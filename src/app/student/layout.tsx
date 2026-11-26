import { requireRolePage } from "@/lib/auth-guard";
import { LogoutButton } from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRolePage("STUDENT");
  return (
    <div className="p-8">
      <header className="mb-4 flex items-center justify-between">
        <span>{user.name} ({user.roll})</span>
        <div className="flex items-center gap-4">
          <NotificationBell userId={Number(user.id)} />
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
