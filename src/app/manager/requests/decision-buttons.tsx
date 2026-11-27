"use client";

import { useActionState } from "react";
import { approveRequestAction, rejectRequestAction } from "@/lib/actions/manager";

export function DecisionButtons({ requestId }: { requestId: number }) {
  const [approveState, approve, approving] = useActionState(approveRequestAction, null);
  const [rejectState, reject, rejecting] = useActionState(rejectRequestAction, null);
  const state = approveState ?? rejectState;
  return (
    <div className="flex items-center gap-2">
      <form action={approve}>
        <input type="hidden" name="requestId" value={requestId} />
        <button type="submit" disabled={approving || rejecting} className="rounded bg-black px-3 py-1 text-white disabled:opacity-50">
          Approve
        </button>
      </form>
      <form action={reject}>
        <input type="hidden" name="requestId" value={requestId} />
        <button type="submit" disabled={approving || rejecting} className="rounded border px-3 py-1 disabled:opacity-50">
          Reject
        </button>
      </form>
      {state && "error" in state && (
        <span role="alert" className="text-red-600">
          {state.error}
        </span>
      )}
    </div>
  );
}
