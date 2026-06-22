import PricingPlan from "../models/pricingPlan.model.js";
import ApiError from "../utils/ApiError.js";

export const getActivePlansService = async () =>
  PricingPlan.find({ isActive: true }).sort({ sortOrder: 1, tier: 1 });

export const getAllPlansService = async () =>
  PricingPlan.find().sort({ sortOrder: 1, tier: 1 });

export const getPlanByIdService = async (id) => {
  const plan = await PricingPlan.findById(id);
  if (!plan) throw ApiError.notFound("Pricing plan not found");
  return plan;
};

export const getPlanBySlugService = async (slug) => {
  const plan = await PricingPlan.findOne({ slug, isActive: true });
  if (!plan) throw ApiError.notFound("Pricing plan not found");
  return plan;
};

export const createPlanService = async (data) => {
  const existing = await PricingPlan.findOne({ slug: data.slug?.toLowerCase() });
  if (existing) throw ApiError.conflict("Plan slug already exists");
  return PricingPlan.create(data);
};

export const updatePlanService = async (id, data) => {
  if (data.slug) {
    const clash = await PricingPlan.findOne({
      slug: data.slug.toLowerCase(),
      _id: { $ne: id },
    });
    if (clash) throw ApiError.conflict("Plan slug already exists");
  }
  const plan = await PricingPlan.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!plan) throw ApiError.notFound("Pricing plan not found");
  return plan;
};

export const deletePlanService = async (id) => {
  const plan = await PricingPlan.findByIdAndDelete(id);
  if (!plan) throw ApiError.notFound("Pricing plan not found");
  return plan;
};

export const seedDefaultPlansService = async () => {
  const count = await PricingPlan.countDocuments();
  if (count > 0) return;

  await PricingPlan.insertMany([
    {
      name: "Free",
      slug: "free",
      description: "Get started with essential features",
      price: 0,
      durationDays: 36500,
      periodLabel: "Forever",
      tier: 0,
      sortOrder: 0,
      features: [
        "500 MCQs access",
        "2 Mock Tests / month",
        "Basic analytics",
        "Community discussion room",
        "Daily challenge access",
      ],
    },
    {
      name: "Pro",
      slug: "pro",
      description: "Everything you need to crack the exam",
      price: 1499,
      durationDays: 90,
      periodLabel: "/ 3 months",
      tier: 1,
      isPopular: true,
      sortOrder: 1,
      features: [
        "Full 85,000+ MCQ bank",
        "Unlimited mock tests",
        "Adaptive learning engine",
        "AI summaries & video summarizer",
        "Full past papers library",
        "Advanced analytics dashboard",
        "Flashcards with spaced repetition",
        "Offline mode & multi-device sync",
        "Priority support",
      ],
    },
    {
      name: "Ultimate",
      slug: "ultimate",
      description: "Pro features plus expert mentorship",
      price: 2999,
      durationDays: 180,
      periodLabel: "/ 6 months",
      tier: 2,
      sortOrder: 2,
      features: [
        "Everything in Pro",
        "1-on-1 expert mentorship",
        "Personalized study plan",
        "Exam strategy workshops",
        "WhatsApp support group",
        "Score guarantee program",
      ],
    },
  ]);
};
