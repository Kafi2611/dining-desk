import { prisma } from "@/lib/prisma";
import type {
  PendingRequestRepository,
  PendingRequestRow,
} from "@/lib/repositories/pending-request-repository";

export class PrismaPendingRequestRepository implements PendingRequestRepository {
  async listPending(): Promise<PendingRequestRow[]> {
    const requests = await prisma.rechargeRequest.findMany({
      where: { status: "PENDING", method: "OFFLINE" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { roll: true, name: true } } },
    });
    return requests.map((r) => ({
      id: r.id,
      roll: r.user.roll,
      name: r.user.name,
      amount: r.amount,
      reference: r.reference,
      createdAt: r.createdAt,
    }));
  }
}
