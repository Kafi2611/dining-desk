import Link from "next/link";
import { requireRolePage } from "@/lib/auth-guard";
import { settings, walletRepository } from "@/lib/container";
import { formatTaka } from "@/lib/money";
import { dhakaTomorrow } from "@/lib/services/dhaka-time";
import { BuyGuestCouponForm, BuyTokenForm } from "@/app/student/buy-token/token-forms";

export default async function BuyTokenPage() {
  const user = await requireRolePage("STUDENT");
  const wallet = await walletRepository.getWalletByUserId(Number(user.id));
  const rates = await settings.get();
  const date = dhakaTomorrow(new Date());

  return (
    <div className="flex flex-col gap-6">
      <Link href="/student" className="underline">
        Back to my wallet
      </Link>
      <h1 className="text-2xl font-bold">Buy token</h1>
      <p>
        Meal date: <span data-testid="meal-date">{date}</span> (tomorrow). Tokens are sold until{" "}
        {rates.cutoffTime}.
      </p>
      <p className="text-xl">
        Balance: <span data-testid="balance">{formatTaka(wallet?.balance ?? 0)}</span>
      </p>
      <div className="flex flex-wrap gap-10">
        <BuyTokenForm
          date={date}
          prices={{ single: formatTaka(rates.mealRate), both: formatTaka(rates.mealRate * 2) }}
        />
        <BuyGuestCouponForm
          date={date}
          prices={{ single: formatTaka(rates.guestRate), both: formatTaka(rates.guestRate * 2) }}
        />
      </div>
    </div>
  );
}
