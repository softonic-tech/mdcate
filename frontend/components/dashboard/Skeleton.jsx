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

// Learn subject / chapter grid skeleton
export const SkeletonLearnGrid = memo(function SkeletonLearnGrid({ count = 6, showStats = true, className = "" }) {
  return (
    <div className={`skeleton-learn-grid ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-learn-card">
          <Skeleton className="skeleton-learn-card__icon" />
          <Skeleton className="skeleton-learn-card__title" />
          <Skeleton className="skeleton-learn-card__board" />
          {showStats && (
            <div className="skeleton-learn-card__stats">
              {[0, 1].map((j) => (
                <div key={j} className="skeleton-learn-card__stat">
                  <Skeleton className="skeleton-learn-card__stat-val" />
                  <Skeleton className="skeleton-learn-card__stat-label" />
                </div>
              ))}
            </div>
          )}
          <Skeleton className="skeleton-learn-card__bar" />
          <Skeleton className="skeleton-learn-card__cta" />
        </div>
      ))}
    </div>
  );
});

// Past-papers / tests / challenges item-card list skeleton
export const SkeletonItemCards = memo(function SkeletonItemCards({ count = 5, className = "" }) {
  return (
    <div className={`skeleton-item-cards ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-item-card">
          <div className="skeleton-item-card__head">
            <Skeleton className="skeleton-item-card__title" />
            <Skeleton className="skeleton-item-card__badge" />
          </div>
          <Skeleton className="skeleton-item-card__meta" />
          <Skeleton className="skeleton-item-card__btn" />
        </div>
      ))}
    </div>
  );
});

// Leaderboard skeleton: podium + list
export const SkeletonLeaderboard = memo(function SkeletonLeaderboard({ className = "" }) {
  const podiumSizes = [
    { avatar: 64, name: 72, pts: 48 },
    { avatar: 80, name: 88, pts: 56 },
    { avatar: 64, name: 72, pts: 48 },
  ];
  return (
    <div className={className || undefined}>
      <div className="skeleton-podium">
        {podiumSizes.map((s, i) => (
          <div key={i} className="skeleton-podium__item">
            <Skeleton
              className="skeleton-podium__avatar"
              style={{ width: s.avatar, height: s.avatar }}
            />
            <Skeleton
              className="skeleton-podium__name"
              style={{ width: s.name }}
            />
            <Skeleton
              className="skeleton-podium__pts"
              style={{ width: s.pts }}
            />
          </div>
        ))}
      </div>
      <SkeletonListRows count={7} />
    </div>
  );
});

// Billing plans skeleton
export const SkeletonBillingPlans = memo(function SkeletonBillingPlans({ count = 3, className = "" }) {
  return (
    <div className={`skeleton-billing-plans ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-billing-plan">
          <Skeleton className="skeleton-billing-plan__title" />
          <Skeleton className="skeleton-billing-plan__price" />
          {[0, 1, 2].map((j) => (
            <Skeleton key={j} className="skeleton-billing-plan__feature" />
          ))}
          <Skeleton className="skeleton-billing-plan__btn" />
        </div>
      ))}
    </div>
  );
});

// Billing payment-settings skeleton (single block)
export const SkeletonBillingSettings = memo(function SkeletonBillingSettings({ className = "" }) {
  return (
    <div className={`skeleton-billing-settings ${className}`.trim()}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-billing-settings__row">
          <Skeleton className="skeleton-billing-settings__label" />
          <Skeleton className="skeleton-billing-settings__value" />
        </div>
      ))}
    </div>
  );
});
