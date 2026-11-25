import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  for (const name of ["Chatro Hall-01", "Chatro Hall-02"]) {
    await prisma.hall.upsert({ where: { name }, update: {}, create: { name } });
  }
  // Defaults come from the schema (PLAN.md section 8).
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
