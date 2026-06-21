"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { FormInput, FormTextarea, FormSelect } from "@/components/forms/FormFields";

import { useCreateNotification, notificationHooks } from "@/hooks/useResource";
import useForm from "@/hooks/useForm";
import { Plus, Bell, Trash2, Pencil } from "lucide-react";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export default function NotificationsPage() {
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);

  const { useList, useUpdate, useRemove } = notificationHooks;
  const { data } = useList();
  const notifications = data?.data || [];

  const createMut = useCreateNotification();
  const updateMut = useUpdate();
  const deleteMut = useRemove();

  const { values, handleChange, reset, setValues } = useForm({
    type: "system",
    title: "",
    message: "",
    scheduledFor: ""
  });

  const openCreate = () => {
    setEdit(null);
    reset({ type: "system", title: "", message: "", scheduledFor: "" });
    setModal(true);
  };

  const openEdit = (n) => {
    setEdit(n);
    setValues({
      type: n.type,
      title: n.title,
      message: n.message,
      scheduledFor: n.scheduledFor?.slice(0, 16) || ""
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...values };
    if (!payload.scheduledFor) delete payload.scheduledFor;

    try {
      if (edit) {
        await updateMut.mutateAsync({ id: edit._id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete notification?")) return;
    await deleteMut.mutateAsync(id);
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Send Notification
        </button>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="card p-10 text-center">
          <Bell size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary text-sm">No notifications yet</p>
        </div>
      )}

      {/* List Table */}
      {notifications.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/20 border-b">
              <tr className="text-left text-sm">
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Message</th>
                <th className="p-4 font-medium">Created</th>
                <th className="p-4 w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n._id} className="border-b hover:bg-muted/30 transition group">
                  <td className="p-4 font-medium">{n.title}</td>
                  <td className="p-4">
                    <span className="badge-status bg-primary/20 text-primary">{n.type}</span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary max-w-[400px] truncate">{n.message}</td>
                  <td className="p-4 text-sm text-text-muted">{new Date(n.createdAt).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEdit(n)} className="btn-icon bg-surface border border-border hover:bg-surface-alt">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(n._id)} className="btn-icon bg-danger text-white hover:bg-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? "Update Notification" : "Send Notification"} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect label="Type" name="type" value={values.type} onChange={handleChange} options={NOTIFICATION_TYPES} />
          <FormInput label="Title" name="title" value={values.title} onChange={handleChange} required />
          <FormTextarea label="Message" name="message" value={values.message} onChange={handleChange} required rows={3} />
          <FormInput label="Schedule" name="scheduledFor" type="datetime-local" value={values.scheduledFor} onChange={handleChange} />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary btn-sm">Cancel</button>
            <button type="submit" className="btn-primary btn-sm">{edit ? "Update" : "Send"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}