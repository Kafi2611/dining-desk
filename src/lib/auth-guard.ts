import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { assertRole, ForbiddenError } from "@/lib/services/authorization";
import type { Role } from "@/lib/repositories/user-repository";

export function homePathFor(role: Role) {
  return role === "MANAGER" ? "/manager" : "/student";
}

// Used by the role layouts: each role sees only its own pages (FR2).
export async function requireRolePage(role: Role) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  try {
    assertRole(session.user, role);
  } catch (e) {
    if (e instanceof ForbiddenError) redirect(homePathFor(session.user.role));
    throw e;
  }
  return session.user;
}
