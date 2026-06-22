"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function PdfModal({ url, onClose }) {
  if (!url || typeof document === "undefined") return null;

  return createPortal(
    <div className="modal-overlay modal-overlay--top" onClick={onClose}>
      <div className="modal modal--pdf" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="PDF viewer">
        <div className="modal__head">
          <div className="modal__head-text">
            <h2>PDF Viewer</h2>
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close PDF">
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="modal__body modal__body--flush">
          <iframe src={url} title="PDF Viewer" className="pdf-modal__frame" />
        </div>
      </div>
    </div>,
    document.body
  );
}
