import Link from "next/link";
import { requireRolePage } from "@/lib/auth-guard";
import { historyService } from "@/lib/container";
import { formatTaka } from "@/lib/money";
import { HistoryError } from "@/lib/services/history-errors";
import { historyFilterSchema } from "@/lib/validators/history";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const TYPES = ["RECHARGE", "MEAL_PURCHASE", "GUEST_PURCHASE", "TRANSFER_IN", "TRANSFER_OUT"];
const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REJECTED"];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDhaka(date: Date) {
  return date.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", hour12: false });
}

export default async function HistoryPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireRolePage("STUDENT");
  const params = await searchParams;
  const parsed = historyFilterSchema.safeParse({
    type: first(params.type),
    status: first(params.status),
    fromDate: first(params.fromDate),
    toDate: first(params.toDate),
  });
  const filters = parsed.success ? parsed.data : {};

  let error = parsed.success ? null : "One of the filters is not valid";
  let rows: Awaited<ReturnType<typeof historyService.list>> = [];
  try {
    rows = await historyService.list(Number(user.id), filters);
  } catch (e) {
    if (!(e instanceof HistoryError)) throw e;
    error = e.message;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">History</h1>
        <Link href="/student" className="underline">
          Back to wallet
        </Link>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col text-sm">
          Type
          <select name="type" defaultValue={filters.type ?? ""} className="border p-1">
            <option value="">All</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Status
          <select name="status" defaultValue={filters.status ?? ""} className="border p-1">
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          From date
          <input type="date" name="fromDate" defaultValue={filters.fromDate ?? ""} className="border p-1" />
        </label>
        <label className="flex flex-col text-sm">
          To date
          <input type="date" name="toDate" defaultValue={filters.toDate ?? ""} className="border p-1" />
        </label>
        <button type="submit" className="border px-3 py-1">
          Filter
        </button>
        <Link href="/student/history" className="underline">
          Clear
        </Link>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full border-collapse text-left text-sm" data-testid="history-table">
        <thead>
          <tr className="border-b">
            <th className="p-2">Date (Dhaka)</th>
            <th className="p-2">Type</th>
            <th className="p-2">Method</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Balance after</th>
            <th className="p-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="p-2">
                No transactions found.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{formatDhaka(r.createdAt)}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.method}</td>
              <td className="p-2">{formatTaka(r.amount)}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{formatTaka(r.balanceAfter)}</td>
              <td className="p-2">{r.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
