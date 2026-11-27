import Link from "next/link";
import { managerService } from "@/lib/container";

export default async function ManagerDashboard() {
  const counts = await managerService.tomorrowCounts();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Manager dashboard</h1>
      <nav className="flex gap-4">
        <Link href="/manager/requests" className="underline">
          Offline recharge requests
        </Link>
        <Link href="/manager/settings" className="underline">
          Settings
        </Link>
      </nav>

      <h2 className="text-lg font-semibold">Tomorrow ({counts.date})</h2>
      <table className="w-fit border-collapse text-left" data-testid="meal-counts">
        <tbody>
          <tr className="border-b">
            <th className="p-2">Lunch</th>
            <td className="p-2" data-testid="count-lunch">
              {counts.lunch}
            </td>
          </tr>
          <tr className="border-b">
            <th className="p-2">Dinner</th>
            <td className="p-2" data-testid="count-dinner">
              {counts.dinner}
            </td>
          </tr>
          <tr className="border-b">
            <th className="p-2">Guest coupons</th>
            <td className="p-2" data-testid="count-guests">
              {counts.guests}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm">A &quot;Both&quot; token counts for lunch and for dinner.</p>
    </div>
  );
}
