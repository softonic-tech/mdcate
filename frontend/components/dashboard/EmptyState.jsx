"use client";

import { memo } from "react";

function EmptyState({ icon: Icon, title, description, action, className = "" }) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {Icon && <Icon size={40} strokeWidth={1.5} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

export default memo(EmptyState);
