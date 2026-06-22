"use client";

import { memo } from "react";

function SectionTitle({ title, description, action }) {
  return (
    <div className="section-title">
      <div>
        <h2 className="section-title__heading">{title}</h2>
        {description && <p className="section-title__desc">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default memo(SectionTitle);
