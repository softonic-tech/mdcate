"use client";

import { memo } from "react";

export const Skeleton = memo(function Skeleton({ className = "", ...props }) {
  return <span className={`skeleton ${className}`.trim()} aria-hidden="true" {...props} />;
});

export const SkeletonMeta = memo(function SkeletonMeta({ className = "" }) {
  return <Skeleton className={`skeleton-meta ${className}`.trim()} />;
});

export const SkeletonCardGrid = memo(function SkeletonCardGrid({ count = 6, className = "" }) {
  return (
    <div className={`item-grid ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-card">
          <Skeleton className="skeleton-card__title" />
          <Skeleton className="skeleton-card__line" />
          <Skeleton className="skeleton-card__line skeleton-card__line--short" />
        </div>
      ))}
    </div>
  );
});

export const SkeletonStats = memo(function SkeletonStats({ count = 4, className = "" }) {
  return (
    <div className={`study-page__stats skeleton-stats ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="study-page__stat skeleton-stat">
          <Skeleton className="skeleton-stat__label" />
          <Skeleton className="skeleton-stat__value" />
        </div>
      ))}
    </div>
  );
});

export const SkeletonListRows = memo(function SkeletonListRows({ count = 5, className = "" }) {
  return (
    <div className={`data-list skeleton-list ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="data-row skeleton-row">
          <div className="data-row__main">
            <Skeleton className="skeleton-row__title" />
            <Skeleton className="skeleton-row__sub" />
          </div>
          <Skeleton className="skeleton-row__badge" />
        </div>
      ))}
    </div>
  );
});

export const SkeletonMcqList = memo(function SkeletonMcqList({ count = 5, className = "" }) {
  return (
    <div className={`mcq-list skeleton-mcq-list ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <article key={i} className="mcq-card skeleton-mcq-card">
          <div className="skeleton-mcq-card__head">
            <Skeleton className="skeleton-mcq-card__num" />
            <Skeleton className="skeleton-mcq-card__badge" />
          </div>
          <Skeleton className="skeleton-mcq-card__question" />
          <div className="skeleton-mcq-card__options">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="skeleton-mcq-card__option" />
            ))}
          </div>
        </article>
      ))}
    </div>
  );
});

export const SkeletonVideoPlayer = memo(function SkeletonVideoPlayer({ className = "" }) {
  return <div className={`skeleton-video ${className}`.trim()} aria-hidden="true" />;
});

export const SkeletonVsCards = memo(function SkeletonVsCards({ count = 4, className = "" }) {
  return (
    <div className={`vs-grid skeleton-vs-grid ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="vs-card skeleton-vs-card">
          <div className="skeleton-vs-card__head">
            <Skeleton className="skeleton-vs-card__title" />
            <Skeleton className="skeleton-vs-card__badge" />
          </div>
          <Skeleton className="skeleton-vs-card__line" />
          <Skeleton className="skeleton-vs-card__line skeleton-vs-card__line--short" />
        </div>
      ))}
    </div>
  );
});
