import Link from "next/link";
import { pendingRequests } from "@/lib/container";
import { formatTaka } from "@/lib/money";
import { DecisionButtons } from "./decision-buttons";

export default async function RequestsPage() {
  const rows = await pendingRequests.listPending();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Offline recharge requests</h1>
        <Link href="/manager" className="underline">
          Back to dashboard
        </Link>
      </div>
      <table className="w-full border-collapse text-left text-sm" data-testid="requests-table">
        <thead>
          <tr className="border-b">
            <th className="p-2">Roll</th>
            <th className="p-2">Name</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Reference</th>
            <th className="p-2">Requested (Dhaka)</th>
            <th className="p-2">Decision</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="p-2">
                No pending requests.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="border-b" data-testid={`request-${r.id}`}>
              <td className="p-2">{r.roll}</td>
              <td className="p-2">{r.name}</td>
              <td className="p-2">{formatTaka(r.amount)}</td>
              <td className="p-2">{r.reference}</td>
              <td className="p-2">
                {r.createdAt.toLocaleString("en-GB", { timeZone: "Asia/Dhaka", hour12: false })}
              </td>
              <td className="p-2">
                <DecisionButtons requestId={r.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
