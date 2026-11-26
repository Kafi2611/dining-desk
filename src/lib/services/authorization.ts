import type { Role } from "@/lib/repositories/user-repository";
import type { SessionUser } from "@/lib/services/auth-service";

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}

// Server actions and pages call this before doing role-only work (FR2).
export function assertRole(
  user: Pick<SessionUser, "role"> | null | undefined,
  role: Role,
): void {
  if (!user || user.role !== role) throw new ForbiddenError();
}
