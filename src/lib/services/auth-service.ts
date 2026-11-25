import type { Role, UserRepository } from "@/lib/repositories/user-repository";

export interface PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface SessionUser {
  id: number;
  roll: string;
  name: string;
  role: Role;
  hallId: number;
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async login(roll: string, password: string): Promise<SessionUser | null> {
    const user = await this.users.findByRoll(roll);
    if (!user) return null;
    const ok = await this.hasher.compare(password, user.passwordHash);
    if (!ok) return null;
    return {
      id: user.id,
      roll: user.roll,
      name: user.name,
      role: user.role,
      hallId: user.hallId,
    };
  }
}
