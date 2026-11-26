import { describe, it, expect } from "vitest";
import { assertRole, ForbiddenError } from "@/lib/services/authorization";

const student = { id: 1, roll: "2203139", name: "S", role: "STUDENT" as const, hallId: 1 };
const manager = { id: 2, roll: "9000001", name: "M", role: "MANAGER" as const, hallId: 1 };

describe("assertRole", () => {
  it("refuses a student on a manager-only action", () => {
    expect(() => assertRole(student, "MANAGER")).toThrow(ForbiddenError);
  });

  it("lets a manager use a manager-only action", () => {
    expect(() => assertRole(manager, "MANAGER")).not.toThrow();
  });

  it("refuses a manager on a student-only action", () => {
    expect(() => assertRole(manager, "STUDENT")).toThrow(ForbiddenError);
  });

  it("refuses a missing user", () => {
    expect(() => assertRole(null, "STUDENT")).toThrow(ForbiddenError);
  });
});
