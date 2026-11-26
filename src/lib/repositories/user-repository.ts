export type Role = "STUDENT" | "MANAGER";

export interface UserRecord {
  id: number;
  roll: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  hallId: number;
}

// Database access goes through this interface so tests can pass a mock.
export interface UserRepository {
  findByRoll(roll: string): Promise<UserRecord | null>;
}
