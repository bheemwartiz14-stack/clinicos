"use client";

import { updateLeaveBlockAction, deleteLeaveBlockAction, type DoctorActionState } from "../actions/doctor.actions";

interface LeaveListProps {
  doctorId: string;
  leaves: Array<{
    id: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    startTime: string | null;
    endTime: string | null;
    reason: string | null;
    status: "pending" | "approved" | "rejected";
  }>;
  canManage: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved": return "bg-green-100 text-green-700";
    case "rejected": return "bg-red-100 text-red-700";
    default: return "bg-amber-100 text-amber-700";
  }
}

export function DoctorLeaveList({ doctorId, leaves, canManage }: LeaveListProps) {
  const handleStatusChange = async (id: string, status: string) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("status", status);
    await updateLeaveBlockAction({ ok: false }, formData);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this leave request?")) {
      await deleteLeaveBlockAction(id);
    }
  };

  if (leaves.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-slate-500">No leave requests found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaves.map((leave) => (
        <div key={leave.id} className="rounded-xl border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(leave.status)}`}>
                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                </span>
                <span className="text-sm font-medium text-slate-900">
                  {leave.leaveType === "full_day" ? "Full Day" : leave.leaveType === "half_day" ? "Half Day" : "Custom Time"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {formatDate(leave.fromDate)} - {formatDate(leave.toDate)}
                {leave.startTime && leave.endTime && ` (${leave.startTime} - ${leave.endTime})`}
              </p>
              {leave.reason && <p className="mt-1 text-sm text-slate-500">{leave.reason}</p>}
            </div>
            {canManage && leave.status === "pending" && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleStatusChange(leave.id, "approved")} className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                  Approve
                </button>
                <button onClick={() => handleStatusChange(leave.id, "rejected")} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                  Reject
                </button>
                <button onClick={() => handleDelete(leave.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}