"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { FormTextarea, FormSelect } from "@/components/forms/FormFields";
import { useContactMessages, useRespondToContact, useDeleteContact } from "@/hooks/useResource";
import useForm from "@/hooks/useForm";
import { formatDate, getName, truncate } from "@/lib/utils";
import { CONTACT_STATUSES } from "@/lib/constants";

export default function ContactMessagesPage() {
  const [respondModal, setRespondModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [filter, setFilter] = useState("");

  const { data, isLoading, error, refetch } = useContactMessages();
  const respondMut = useRespondToContact();
  const deleteMut = useDeleteContact();

  const { values, handleChange, reset } = useForm({ status: "resolved", response: "" });

  const openRespond = (item) => {
    reset({ status: item.status === "resolved" ? "resolved" : "resolved", response: item.response || "" });
    setRespondModal({ open: true, item });
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    try {
      await respondMut.mutateAsync({ id: respondModal.item._id, data: values });
      setRespondModal({ open: false, item: null });
    } catch {}
  };

  const messages = (data?.data || []).filter((m) => !filter || m.status === filter);

  const columns = [
    { key: "email", label: "Email" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message", render: (row) => <span className="text-xs text-text-muted">{truncate(row.message, 50)}</span> },
    {
      key: "status", label: "Status",
      render: (row) => <StatusBadge variant={row.status === "pending" ? "warning" : "success"}>{row.status}</StatusBadge>,
    },
    { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) },
    {
      key: "_actions", label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openRespond(row)} className="btn-ghost btn-sm text-primary">Respond</button>
          <button onClick={() => setConfirm({ open: true, id: row._id })} className="btn-ghost btn-sm text-danger">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Contact Messages</h1>
      </div>

      <div className="mb-4 max-w-xs">
        <FormSelect name="filter" value={filter} onChange={(e) => setFilter(e.target.value)} options={CONTACT_STATUSES} placeholder="All statuses" />
      </div>

      <DataTable columns={columns} data={messages} loading={isLoading} error={error} onRetry={refetch} emptyMessage="No messages" />

      <Modal open={respondModal.open} onClose={() => setRespondModal({ open: false, item: null })} title="Respond to Message" size="md">
        {respondModal.item && (
          <div className="mb-4 p-3 bg-surface-alt rounded-lg text-sm space-y-1">
            <p><span className="font-medium">From:</span> {respondModal.item.email}</p>
            <p><span className="font-medium">Subject:</span> {respondModal.item.subject}</p>
            <p><span className="font-medium">Message:</span> {respondModal.item.message}</p>
          </div>
        )}
        <form onSubmit={handleRespond} className="space-y-4">
          <FormSelect label="Status" name="status" value={values.status} onChange={handleChange} options={CONTACT_STATUSES} />
          <FormTextarea label="Response" name="response" value={values.response} onChange={handleChange} required rows={4} placeholder="Type your response..." />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setRespondModal({ open: false, item: null })} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" disabled={respondMut.isPending} className="btn-primary btn-sm">
              {respondMut.isPending ? "Sending..." : "Send Response"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={async () => { await deleteMut.mutateAsync(confirm.id); setConfirm({ open: false, id: null }); }}
        loading={deleteMut.isPending}
      />
    </div>
  );
}
