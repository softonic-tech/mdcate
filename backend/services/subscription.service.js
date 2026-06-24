export const buildSubscriptionSummary = (user) => {
  const sub = user.subscription || {};
  const now = new Date();
  const periodEndsAt = sub.currentPeriodEndsAt ? new Date(sub.currentPeriodEndsAt) : null;

  let effectiveStatus = sub.status || "expired";

  // Legacy trial accounts — no free access
  if (effectiveStatus === "trialing") {
    effectiveStatus = "expired";
  }

  if (user.role === "admin") {
    return {
      planSlug: "admin",
      status: "active",
      isActive: true,
      needsUpgrade: false,
      currentPeriodEndsAt: periodEndsAt,
      daysRemaining: null,
    };
  }

  if (effectiveStatus === "active" && periodEndsAt && periodEndsAt <= now) {
    effectiveStatus = "expired";
  }

  const isActive = effectiveStatus === "active";

  let daysRemaining = null;
  if (effectiveStatus === "active" && periodEndsAt) {
    daysRemaining = Math.max(0, Math.ceil((periodEndsAt - now) / (1000 * 60 * 60 * 24)));
  }

  return {
    planSlug: sub.planSlug || "none",
    planId: sub.planId || null,
    status: effectiveStatus,
    isActive,
    needsUpgrade: !isActive,
    currentPeriodEndsAt: periodEndsAt,
    daysRemaining,
  };
};

export const initializeUnpaidSubscription = (user) => {
  if (user.role === "admin") return user;
  if (!user.subscription) user.subscription = {};
  user.subscription.planSlug = "none";
  user.subscription.status = "expired";
  user.subscription.planId = null;
  user.subscription.trialStartedAt = null;
  user.subscription.trialEndsAt = null;
  user.subscription.currentPeriodEndsAt = null;
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
