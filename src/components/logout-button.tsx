import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="rounded border px-3 py-1">
        Log out
      </button>
    </form>
  );
}
