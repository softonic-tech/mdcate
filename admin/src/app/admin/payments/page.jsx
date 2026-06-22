"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { paymentHooks } from "@/hooks/useResource";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const columns = [
  {
    key: "userId",
    label: "User",
    render: (row) => row.userId?.email || row.userId?.username || "—",
  },
  {
    key: "planId",
    label: "Plan",
    render: (row) => row.planId?.name || "—",
  },
  {
    key: "amount",
    label: "Amount",
    render: (row) => `PKR ${row.amount?.toLocaleString?.() || row.amount}`,
  },
  {
    key: "provider",
    label: "Provider",
    render: (row) => <StatusBadge variant="info">{row.provider}</StatusBadge>,
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <StatusBadge
        variant={row.status === "completed" ? "success" : row.status === "pending" ? "warning" : "danger"}
      >
        {row.status}
      </StatusBadge>
    ),
  },
  { key: "txnRef", label: "Txn ref" },
  { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
];

export default function PaymentsPage() {
  const { data, isLoading } = paymentHooks.useList();
  const approveMut = paymentHooks.useApprove();
  const [approvingId, setApprovingId] = useState(null);

  const payments = data?.data || data || [];

  const handleApprove = async (id) => {
    try {
      setApprovingId(id);
      await approveMut.mutateAsync(id);
      toast.success("Payment approved and plan activated");
    } catch {
      toast.error("Failed to approve payment");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
        <p className="text-text-muted mt-1">
          View JazzCash / Easypaisa transactions. Manually approve pending payments if needed.
        </p>
      </div>

      <DataTable
        columns={[
          ...columns,
          {
            key: "actions",
            label: "Actions",
            render: (row) =>
              row.status === "pending" ? (
                <button
                  type="button"
                  className="text-sm font-medium text-teal hover:underline disabled:opacity-50"
                  disabled={approvingId === row._id}
                  onClick={() => handleApprove(row._id)}
                >
                  {approvingId === row._id ? "Approving…" : "Approve"}
                </button>
              ) : (
                "—"
              ),
          },
        ]}
        data={payments}
        loading={isLoading}
        emptyMessage="No payments yet"
      />
    </div>
  );
}
