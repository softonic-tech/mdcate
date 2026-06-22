"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
  as: Component = "div",
  onSubmit,
  className = "",
  bodyClassName = "",
}) {
  const titleId = useId();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass =
    size === "xl" ? "modal--xl" : size === "lg" ? "modal--lg" : "";

  const panelProps = {
    className: `modal ${sizeClass} ${className}`.trim(),
    onClick: (e) => e.stopPropagation(),
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
    ...(Component === "form" && onSubmit ? { onSubmit } : {}),
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <Component {...panelProps}>
        <div className="modal__head">
          <div className="modal__head-text">
            <h2 id={titleId}>{title}</h2>
            {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className={`modal__body${bodyClassName ? ` ${bodyClassName}` : ""}`}>
          {children}
        </div>

        {footer ? <div className="modal__footer">{footer}</div> : null}
      </Component>
    </div>,
    document.body
  );
}
