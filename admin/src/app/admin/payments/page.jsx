"use client";

import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import DataTable from "@/components/tables/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { paymentHooks } from "@/hooks/useResource";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUS_VARIANT = {
  completed: "success",
  awaiting_review: "warning",
  pending: "warning",
  rejected: "danger",
  failed: "danger",
  cancelled: "danger",
};

function PaymentProofImage({ url, alt, className = "", onClick }) {
  if (!url) {
    return <span className="text-text-muted text-sm">No screenshot</span>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block overflow-hidden rounded-lg border border-border bg-surface-alt ${className}`}
      title="Click to enlarge"
    >
      <img
        src={url}
        alt={alt}
        className="w-full h-full object-contain max-h-48"
        loading="lazy"
      />
    </button>
  );
}

function ProofModal({ payment, onClose }) {
  if (!payment?.proofScreenshotUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface rounded-xl max-w-3xl w-full max-h-[95vh] overflow-auto p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Payment screenshot</h3>
            <p className="text-sm text-text-muted mt-1">
              {payment.userId?.email || payment.userId?.username} · {payment.planId?.name} · PKR{" "}
              {payment.amount?.toLocaleString?.() || payment.amount}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <img
          src={payment.proofScreenshotUrl}
          alt="Payment proof full size"
          className="w-full rounded-lg border border-border"
        />
        <div className="mt-3 flex gap-3">
          <a
            href={payment.proofScreenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink size={14} />
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
}

function PendingPaymentCard({ payment, onPreview, onApprove, onReject, approvingId, rejectingId }) {
  return (
    <article className="card overflow-hidden">
      <div className="grid md:grid-cols-[minmax(200px,280px)_1fr] gap-0">
        <div className="bg-surface-alt p-4 border-b md:border-b-0 md:border-r border-border">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Payment screenshot
          </p>
          <PaymentProofImage
            url={payment.proofScreenshotUrl}
            alt={`Payment proof from ${payment.userId?.email || "student"}`}
            className="w-full min-h-[160px]"
            onClick={() => onPreview(payment)}
          />
          {payment.proofScreenshotUrl && (
            <button
              type="button"
              onClick={() => onPreview(payment)}
              className="mt-2 text-xs text-primary hover:underline"
            >
              View full size
            </button>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-text-primary">
                {payment.userId?.email || payment.userId?.username || "Unknown user"}
              </p>
              <p className="text-sm text-text-muted">{payment.planId?.name || "Plan"}</p>
            </div>
            <StatusBadge variant={STATUS_VARIANT[payment.status] || "warning"}>
              {payment.status === "awaiting_review" ? "Awaiting review" : payment.status}
            </StatusBadge>
          </div>

          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-text-muted text-xs">Amount</dt>
              <dd className="font-medium text-text-primary">
                PKR {payment.amount?.toLocaleString?.() || payment.amount}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">Method</dt>
              <dd className="text-text-secondary capitalize">
                {payment.provider === "manual"
                  ? payment.manualChannel || "manual"
                  : payment.provider}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">Student ref</dt>
              <dd className="text-text-secondary">{payment.studentTxnReference || "—"}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">Txn ref</dt>
              <dd className="text-text-secondary font-mono text-xs">{payment.txnRef}</dd>
            </div>
            <div>
              <dt className="text-text-muted text-xs">Submitted</dt>
              <dd className="text-text-secondary">{formatDate(payment.createdAt)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            <button
              type="button"
              className="btn-primary btn-sm"
              disabled={approvingId === payment._id}
              onClick={() => onApprove(payment._id)}
            >
              {approvingId === payment._id ? "Approving…" : "Approve & activate"}
            </button>
            <button
              type="button"
              className="btn-danger btn-sm"
              disabled={rejectingId === payment._id}
              onClick={() => onReject(payment._id)}
            >
              {rejectingId === payment._id ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PaymentsPage() {
  const { data, isLoading } = paymentHooks.useList();
  const approveMut = paymentHooks.useApprove();
  const rejectMut = paymentHooks.useReject();
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [previewPayment, setPreviewPayment] = useState(null);

  const payments = data?.data || data || [];
  const pendingReview = payments.filter((p) =>
    ["awaiting_review", "pending"].includes(p.status)
  );
  const otherPayments = payments.filter(
    (p) => !["awaiting_review", "pending"].includes(p.status)
  );

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

  const handleReject = async (id) => {
    const reason = window.prompt("Rejection reason (shown to student):", "Payment could not be verified");
    if (reason === null) return;
    try {
      setRejectingId(id);
      await rejectMut.mutateAsync({ id, reason });
      toast.success("Payment rejected");
    } catch {
      toast.error("Failed to reject payment");
    } finally {
      setRejectingId(null);
    }
  };

  const historyColumns = [
    {
      key: "proof",
      label: "Screenshot",
      render: (row) => (
        <div className="!whitespace-normal py-1">
          <PaymentProofImage
            url={row.proofScreenshotUrl}
            alt="Payment proof"
            className="w-24 h-24"
            onClick={() => row.proofScreenshotUrl && setPreviewPayment(row)}
          />
        </div>
      ),
    },
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
      label: "Method",
      render: (row) =>
        row.provider === "manual" ? (
          <StatusBadge variant="info">Manual ({row.manualChannel || "—"})</StatusBadge>
        ) : (
          <StatusBadge variant="info">{row.provider}</StatusBadge>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge variant={STATUS_VARIANT[row.status] || "info"}>{row.status}</StatusBadge>
      ),
    },
    { key: "txnRef", label: "Txn ref" },
    { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Payments</h1>
        <p className="text-text-muted mt-1">
          Verify payment screenshots and activate student subscriptions.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Awaiting review
          {pendingReview.length > 0 && (
            <span className="ml-2 text-sm font-normal text-warning">
              ({pendingReview.length})
            </span>
          )}
        </h2>

        {isLoading ? (
          <p className="text-text-muted">Loading payments…</p>
        ) : pendingReview.length === 0 ? (
          <p className="text-sm text-text-muted card p-4">No payments waiting for review.</p>
        ) : (
          <div className="space-y-4">
            {pendingReview.map((payment) => (
              <PendingPaymentCard
                key={payment._id}
                payment={payment}
                onPreview={setPreviewPayment}
                onApprove={handleApprove}
                onReject={handleReject}
                approvingId={approvingId}
                rejectingId={rejectingId}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Payment history</h2>
        <DataTable
          columns={historyColumns}
          data={otherPayments}
          loading={isLoading}
          emptyMessage="No completed or rejected payments yet"
        />
      </section>

      {previewPayment && (
        <ProofModal payment={previewPayment} onClose={() => setPreviewPayment(null)} />
      )}
    </div>
  );
}
