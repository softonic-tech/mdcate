"use client";

import { memo } from "react";

function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  const Icon = eyebrow?.icon;

  return (
    <header className={`page-head ${className}`.trim()}>
      <div className="page-head__row">
        <div className="page-head__content">
          {eyebrow && (
            <span className="page-head__eyebrow">
              {Icon && <Icon size={14} strokeWidth={2} />}
              {eyebrow.label}
            </span>
          )}
          <h1 className="page-head__title">{title}</h1>
          {description && <p className="page-head__desc">{description}</p>}
        </div>
        {actions && <div className="page-head__actions">{actions}</div>}
      </div>
    </header>
  );
}

export default memo(PageHeader);
