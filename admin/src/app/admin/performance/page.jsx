"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { performanceHooks } from "@/hooks/useResource";
import { getName, formatDate } from "@/lib/utils";

export default function PerformancePage() {
  const { data, isLoading, error, refetch } = performanceHooks.useList();
  const removeMut = performanceHooks.useRemove();
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const columns = [
    { key: "userId", label: "User", render: (row) => getName(row.userId) },
    { key: "subjectId", label: "Subject", render: (row) => getName(row.subjectId) },
    { key: "chapterId", label: "Chapter", render: (row) => getName(row.chapterId, "—") },
    { key: "totalQuestions", label: "Total Q" },
    { key: "correctAnswers", label: "Correct" },
    {
      key: "accuracy", label: "Accuracy",
      render: (row) => {
        const pct = row.totalQuestions ? Math.round((row.correctAnswers / row.totalQuestions) * 100) : 0;
        return <span className={pct >= 70 ? "text-emerald-600 font-medium" : pct >= 40 ? "text-amber-600" : "text-red-600"}>{pct}%</span>;
      },
    },
    { key: "timeSpent", label: "Time", render: (row) => `${Math.round((row.timeSpent || 0) / 60)} min` },
    { key: "date", label: "Date", render: (row) => formatDate(row.date || row.createdAt) },
    {
      key: "_actions", label: "",
      render: (row) => (
        <button onClick={() => setConfirm({ open: true, id: row._id })} className="btn-ghost btn-sm text-danger">Delete</button>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Performance Records</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        emptyMessage="No performance data"
      />

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={async () => { await removeMut.mutateAsync(confirm.id); setConfirm({ open: false, id: null }); }}
        loading={removeMut.isPending}
      />
    </div>
  );
}
