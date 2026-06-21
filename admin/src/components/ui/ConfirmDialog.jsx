"use client";

import Modal from "./Modal";

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title || "Confirm Action"} size="sm">
      <p className="text-text-secondary text-sm mb-6">{message || "Are you sure? This action cannot be undone."}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary btn-sm" disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-danger btn-sm" disabled={loading}>
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
