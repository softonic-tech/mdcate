"use client";

import { memo, isValidElement } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomSelect } from "@/components/dashboard/CustomSelect";

export const FilterPanel = memo(function FilterPanel({
  children,
  onClear,
  hasActiveFilters,
  ariaLabel = "Filters",
}) {
  return (
    <section className="study-page__filters" aria-label={ariaLabel}>
      {children}
      {hasActiveFilters && onClear && (
        <button type="button" className="study-page__clear-filters" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </section>
  );
});

export const FilterSearch = memo(function FilterSearch({
  value,
  onChange,
  placeholder = "Search…",
  ariaLabel = "Search",
}) {
  return (
    <div className="study-page__search-wrap">
      <Search size={16} className="study-page__search-icon" aria-hidden="true" />
      <input
        type="search"
        className="study-page__search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </div>
  );
});

export const FilterSelect = CustomSelect;

export const FilterField = memo(function FilterField({ label, icon: Icon, children }) {
  const field =
    isValidElement(children) && children.type === "select" ? (
      <CustomSelect {...children.props}>{children.props.children}</CustomSelect>
    ) : (
      children
    );

  return (
    <label className="study-page__filter-field">
      <span className="study-page__filter-label">
        {Icon && <Icon size={14} aria-hidden="true" />}
        {label}
      </span>
      {field}
    </label>
  );
});

export const FilterRow = memo(function FilterRow({ children }) {
  return <div className="study-page__filter-row">{children}</div>;
});

export const FilterPills = memo(function FilterPills({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  ariaLabel,
}) {
  return (
    <div className="study-page__diff-row">
      {(label || Icon) && (
        <span className="study-page__filter-label">
          {Icon && <Icon size={14} aria-hidden="true" />}
          {label}
        </span>
      )}
      <div className="study-page__diff-pills" role="group" aria-label={ariaLabel || label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`study-page__diff-pill${value === opt.value ? " study-page__diff-pill--active" : ""}${opt.variant ? ` study-page__diff-pill--${opt.variant}` : ""}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});

export const StatStrip = memo(function StatStrip({ items }) {
  if (!items?.length) return null;
  return (
    <div className="study-page__stats">
      {items.map((item) => (
        <div
          key={item.label}
          className={`study-page__stat${item.accent ? " study-page__stat--accent" : ""}`}
        >
          <span className="study-page__stat-label">{item.label}</span>
          <span
            className={`study-page__stat-value${item.success ? " study-page__stat-value--success" : ""}`}
          >
            {item.value}
          </span>
          {item.progress != null && (
            <div className="study-page__stat-bar" aria-hidden="true">
              <div
                className="study-page__stat-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export const ListMeta = memo(function ListMeta({ start, end, total, label = "items", extra }) {
  let text;
  if (total != null && start != null) {
    text = `Showing ${start}–${end} of ${total} ${label}`;
  } else if (end != null) {
    text = `${end} ${label}`;
  } else {
    text = null;
  }

  if (!text && !extra) return null;

  return (
    <div className="study-page__list-head">
      {text && <p className="study-page__list-meta">{text}</p>}
      {extra}
    </div>
  );
});

export const PaginationBar = memo(function PaginationBar({
  page,
  totalPages,
  onPageChange,
  disabledPrev,
  disabledNext,
}) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav className="mcq-pagination study-page__pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn-ghost"
        disabled={disabledPrev ?? page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
        Previous
      </button>
      <span className="mcq-pagination__info">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn-ghost"
        disabled={disabledNext ?? page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
});

export const PageTip = memo(function PageTip({ children }) {
  if (!children) return null;
  return <p className="study-page__tip">{children}</p>;
});
