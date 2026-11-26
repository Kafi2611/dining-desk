import { describe, it, expect, vi } from "vitest";
import { AuthService } from "@/lib/services/auth-service";

const student = {
  id: 1,
  roll: "2203139",
  name: "Test Student",
  email: "s@example.com",
  passwordHash: "hashed-secret",
  role: "STUDENT" as const,
  hallId: 1,
};

function setup(found: typeof student | null = student, passwordMatches = true) {
  const users = { findByRoll: vi.fn().mockResolvedValue(found) };
  const hasher = { compare: vi.fn().mockResolvedValue(passwordMatches) };
  return { users, hasher, service: new AuthService(users, hasher) };
}

describe("AuthService.login", () => {
  it("accepts the correct roll and password", async () => {
    const { service, users, hasher } = setup();

    const result = await service.login("2203139", "secret");

    expect(users.findByRoll).toHaveBeenCalledWith("2203139");
    expect(hasher.compare).toHaveBeenCalledWith("secret", "hashed-secret");
    expect(result).toEqual({
      id: 1,
      roll: "2203139",
      name: "Test Student",
      role: "STUDENT",
      hallId: 1,
    });
  });

  it("refuses a wrong password", async () => {
    const { service } = setup(student, false);

    const result = await service.login("2203139", "wrong");

    expect(result).toBeNull();
  });
});
