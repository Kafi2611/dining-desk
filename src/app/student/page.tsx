import Link from "next/link";
import { requireRolePage } from "@/lib/auth-guard";
import { walletRepository } from "@/lib/container";
import { formatTaka } from "@/lib/money";
import {
  RechargeOfflineForm,
  RechargeOnlineForm,
  TransferForm,
} from "@/app/student/wallet-forms";

export default async function StudentDashboard() {
  const user = await requireRolePage("STUDENT");
  const wallet = await walletRepository.getWalletByUserId(Number(user.id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">My wallet</h1>
      <Link href="/student/history" className="underline">
        History
      </Link>
      <p className="text-xl">
        Balance: <span data-testid="balance">{formatTaka(wallet?.balance ?? 0)}</span>
      </p>
      <div className="flex flex-wrap gap-10">
        <RechargeOnlineForm />
        <RechargeOfflineForm />
        <TransferForm />
      </div>
    </div>
  );
}
