import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// DEMO ONLY: this password is for local demo accounts. Never use it for real users.
const DEMO_PASSWORD = "demo1234";

const users = [
  { roll: "9000001", name: "Meal Manager", role: "MANAGER", hall: "Chatro Hall-01" },
  { roll: "2203001", name: "Student One", role: "STUDENT", hall: "Chatro Hall-01" },
  { roll: "2203002", name: "Student Two", role: "STUDENT", hall: "Chatro Hall-01" },
  { roll: "2203003", name: "Student Three", role: "STUDENT", hall: "Chatro Hall-01" },
  { roll: "2203004", name: "Student Four", role: "STUDENT", hall: "Chatro Hall-02" },
] as const;

async function main() {
  const halls: Record<string, number> = {};
  for (const name of ["Chatro Hall-01", "Chatro Hall-02"]) {
    const hall = await prisma.hall.upsert({ where: { name }, update: {}, create: { name } });
    halls[name] = hall.id;
  }
  // Defaults come from the schema (PLAN.md section 8).
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  for (const u of users) {
    const data = {
      name: u.name,
      email: `${u.roll}@demo.local`,
      passwordHash,
      role: u.role,
      hallId: halls[u.hall],
    };
    await prisma.user.upsert({
      where: { roll: u.roll },
      update: data,
      create: { roll: u.roll, ...data },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
