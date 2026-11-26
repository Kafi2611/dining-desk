import { requireRolePage } from "@/lib/auth-guard";
import { LogoutButton } from "@/components/logout-button";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRolePage("STUDENT");
  return (
    <div className="p-8">
      <header className="mb-4 flex items-center justify-between">
        <span>{user.name} ({user.roll})</span>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
