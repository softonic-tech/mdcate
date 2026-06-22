import env from "../config/env.config.js";

export const TRIAL_DAYS = Number(env.TRIAL_DAYS || 7);

export const getTrialEndDate = (from = new Date()) => {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end;
};

export const buildSubscriptionSummary = (user) => {
  const sub = user.subscription || {};
  const now = new Date();
  const trialEndsAt = sub.trialEndsAt ? new Date(sub.trialEndsAt) : null;
  const periodEndsAt = sub.currentPeriodEndsAt ? new Date(sub.currentPeriodEndsAt) : null;

  let effectiveStatus = sub.status || "trialing";
  if (user.role === "admin") {
    return {
      planSlug: "admin",
      status: "active",
      isActive: true,
      needsUpgrade: false,
      trialEndsAt,
      currentPeriodEndsAt: periodEndsAt,
      daysRemaining: null,
    };
  }

  if (effectiveStatus === "trialing" && trialEndsAt && trialEndsAt <= now) {
    effectiveStatus = "expired";
  }
  if (effectiveStatus === "active" && periodEndsAt && periodEndsAt <= now) {
    effectiveStatus = "expired";
  }

  const isActive =
    effectiveStatus === "trialing" ||
    effectiveStatus === "active";

  let daysRemaining = null;
  if (effectiveStatus === "trialing" && trialEndsAt) {
    daysRemaining = Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)));
  } else if (effectiveStatus === "active" && periodEndsAt) {
    daysRemaining = Math.max(0, Math.ceil((periodEndsAt - now) / (1000 * 60 * 60 * 24)));
  }

  return {
    planSlug: sub.planSlug || "trial",
    planId: sub.planId || null,
    status: effectiveStatus,
    isActive,
    needsUpgrade: effectiveStatus === "expired",
    trialEndsAt,
    currentPeriodEndsAt: periodEndsAt,
    daysRemaining,
  };
};

export const startTrialForUser = (user) => {
  const now = new Date();
  if (!user.subscription) user.subscription = {};
  if (user.subscription.trialStartedAt) return user;

  user.subscription.planSlug = "trial";
  user.subscription.status = "trialing";
  user.subscription.trialStartedAt = now;
  user.subscription.trialEndsAt = getTrialEndDate(now);
  user.subscription.currentPeriodEndsAt = null;
  user.subscription.planId = null;
  return user;
};

export const activatePaidPlan = (user, plan, paymentDate = new Date()) => {
  const endsAt = new Date(paymentDate);
  endsAt.setDate(endsAt.getDate() + plan.durationDays);

  if (!user.subscription) user.subscription = {};
  user.subscription.planSlug = plan.slug;
  user.subscription.planId = plan._id;
  user.subscription.status = "active";
  user.subscription.currentPeriodEndsAt = endsAt;
  return user;
};

export const expireUserSubscription = (user) => {
  if (!user.subscription) user.subscription = {};
  user.subscription.status = "expired";
  return user;
};
