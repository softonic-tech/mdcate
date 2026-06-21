"use client";

import { PageLoader } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Pagination from "@/components/ui/Pagination";

/**
 * Reusable data table.
 *
 * @param {object[]} columns - { key, label, render? }
 * @param {object[]} data
 * @param {boolean} loading
 * @param {object} error
 * @param {function} onRetry
 * @param {object} pagination - { page, totalPages, onPageChange }
 * @param {function} onRowClick
 * @param {string} emptyMessage
 */
export default function DataTable({
  columns = [],
  data = [],
  loading,
  error,
  onRetry,
  pagination,
  onRowClick,
  emptyMessage,
}) {
  if (loading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!data.length) return <EmptyState message={emptyMessage || "No records found"} />;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr
                key={row._id || i}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-surface-alt transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap text-text-secondary">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="px-4 border-t border-border">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
