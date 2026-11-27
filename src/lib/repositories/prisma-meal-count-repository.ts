import { prisma } from "@/lib/prisma";
import type {
  MealCountRepository,
  MealCountRow,
} from "@/lib/repositories/meal-count-repository";

export class PrismaMealCountRepository implements MealCountRepository {
  async countByKindAndMealType(date: string): Promise<MealCountRow[]> {
    const groups = await prisma.mealToken.groupBy({
      by: ["kind", "mealType"],
      where: { date },
      _count: { _all: true },
    });
    return groups.map((g) => ({ kind: g.kind, mealType: g.mealType, count: g._count._all }));
  }
}
