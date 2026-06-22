"use client";

import Modal from "@/components/dashboard/Modal";

export default function AlertDialog({
  open,
  onClose,
  title = "Notice",
  message,
  okLabel = "OK",
  variant = "primary",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <button
          type="button"
          className={variant === "danger" ? "btn-danger btn-ghost" : "btn-primary"}
          onClick={onClose}
        >
          {okLabel}
        </button>
      }
    >
      {message ? <p className="confirm-dialog__message">{message}</p> : null}
    </Modal>
  );
}
