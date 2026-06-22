"use client";

import { memo } from "react";

function LoadingState({ message = "Loading…", className = "" }) {
  return (
    <div className={`loading-state ${className}`.trim()}>
      <span className="loading-state__spinner" aria-hidden="true" />
      {message}
    </div>
  );
}

export default memo(LoadingState);
