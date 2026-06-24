import ApiError from "../utils/ApiError.js";
import { buildSubscriptionSummary } from "../services/subscription.service.js";

export const requireActiveSubscription = (req, _res, next) => {
  if (req.user?.role === "admin") return next();

  const summary = buildSubscriptionSummary(req.user);
  if (summary.isActive) return next();

  return next(
    ApiError.forbidden("An active subscription is required. Please upgrade to continue.")
  );
};
