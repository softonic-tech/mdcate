"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <span className="text-xs text-text-muted">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary btn-sm btn-icon"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary btn-sm btn-icon"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
