"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  CreditCard,
  Smartphone,
  Building2,
  Upload,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  getPricingPlans,
  getMySubscription,
  getMyPayments,
  getPaymentSettings,
  submitManualPayment,
} from "@/api/billing.api";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import PaymentDetailsPanel from "@/components/billing/PaymentDetailsPanel";
import { SkeletonBillingPlans, SkeletonBillingSettings } from "@/components/dashboard/Skeleton";

const normalizePlans = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

const planIdStr = (id) => (id != null ? String(id) : "");

const normalizeSettings = (res) => {
  if (!res) return null;
  const raw = res.jazzcashNumber !== undefined || res.easypaisaNumber !== undefined ? res : res.data;
  return raw || null;
};

const hasConfiguredPaymentDetails = (settings) =>
  Boolean(
    settings?.jazzcashNumber?.trim?.() ||
      settings?.easypaisaNumber?.trim?.() ||
      settings?.bankAccountNumber?.trim?.() ||
      settings?.bankIban?.trim?.() ||
      settings?.bankName?.trim?.()
  );

const isImageFile = (file) =>
  file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || "");

const STATUS_LABELS = {
  awaiting_review: "Awaiting review",
  pending: "Pending",
  completed: "Completed",
  rejected: "Rejected",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [manualChannel, setManualChannel] = useState("jazzcash");
  const [studentTxnReference, setStudentTxnReference] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const settingsRes = await getPaymentSettings();
      setPaymentSettings(normalizeSettings(settingsRes));
    } catch {
      toast.error("Could not load payment account details");
    } finally {
      setSettingsLoading(false);
    }
  };

  const load = async () => {
    try {
      const [plansRes, subRes, payRes] = await Promise.all([
        getPricingPlans(),
        getMySubscription(),
        getMyPayments(),
      ]);
      const planList = normalizePlans(plansRes).filter((p) => p.price > 0);
      setPlans(planList);
      setSubscription(subRes?.data || subRes);
      setPayments(payRes?.data || []);

      if (planList.length > 0) {
        const bySlug = preselectedPlan
          ? planList.find((p) => p.slug === preselectedPlan)
          : null;
        const defaultPlan = bySlug || planList.find((p) => p.isPopular) || planList[0];
        setSelectedPlan(planIdStr(defaultPlan._id));
      }
    } catch {
      toast.error("Failed to load billing info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    load();
  }, [preselectedPlan]);

  useEffect(() => {
    if (!paymentSettings) return;
    if (paymentSettings.jazzcashNumber?.trim?.()) setManualChannel("jazzcash");
    else if (paymentSettings.easypaisaNumber?.trim?.()) setManualChannel("easypaisa");
    else if (
      paymentSettings.bankAccountNumber?.trim?.() ||
      paymentSettings.bankIban?.trim?.()
    ) {
      setManualChannel("bank");
    }
  }, [paymentSettings]);

  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isImageFile(file)) {
      toast.error("Please upload an image (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleManualSubmit = async () => {
    if (!selectedPlan) return toast.error("Select a plan first");
    if (!screenshot) return toast.error("Upload a screenshot of your payment");

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("planId", selectedPlan);
      formData.append("manualChannel", manualChannel);
      if (studentTxnReference.trim()) {
        formData.append("studentTxnReference", studentTxnReference.trim());
      }
      formData.append("screenshot", screenshot);

      await submitManualPayment(formData);
      toast.success("Payment submitted — admin will verify and activate your plan");
      setScreenshot(null);
      setScreenshotPreview(null);
      setStudentTxnReference("");
      await load();
    } catch (err) {
      toast.error(err?.message || "Could not submit payment");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlanData = plans.find((p) => planIdStr(p._id) === planIdStr(selectedPlan));
  const autoEnabled = paymentSettings?.automaticPaymentsEnabled;
  const hasManualDetails = hasConfiguredPaymentDetails(paymentSettings);
  const canSubmit = Boolean(selectedPlan) && Boolean(screenshot) && hasManualDetails && !submitting;

  const submitBlockers = [];
  if (!hasManualDetails) submitBlockers.push("payment account details are not configured yet");
  if (!selectedPlan) submitBlockers.push("select a plan");
  if (!screenshot) submitBlockers.push("upload a payment screenshot");

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: CreditCard, label: "Billing" }}
        title="Upgrade Your Plan"
        description="Send payment to the accounts below, then upload your receipt. We will activate your subscription after verification."
      />

      {subscription && (
        <section className="content-card content-card--spaced billing-status">
          <div className="billing-status__row">
            <div>
              <p className="billing-status__label">Current status</p>
              <h2 className="billing-status__value">
                {subscription.status === "active" && "Active subscription"}
                {subscription.status === "expired" && "No active subscription"}
                {subscription.status === "cancelled" && "Cancelled"}
              </h2>
              {subscription.status === "active" && subscription.daysRemaining != null && (
                <p className="billing-status__meta">
                  {subscription.daysRemaining} day{subscription.daysRemaining === 1 ? "" : "s"} remaining
                </p>
              )}
            </div>
            {subscription.isActive && (
              <span className="badge badge--success">
                <CheckCircle2 size={14} /> Access active
              </span>
            )}
          </div>
        </section>
      )}

      <section className="content-card content-card--spaced">
        {settingsLoading ? (
          <SkeletonBillingSettings />
        ) : (
          <PaymentDetailsPanel
            settings={paymentSettings}
            amount={selectedPlanData?.price}
          />
        )}
      </section>

      {loading ? (
        <SkeletonBillingPlans count={3} />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No paid plans available"
          description="Ask an admin to configure pricing plans."
        />
      ) : (
        <div className="billing-grid">
          {plans.map((plan) => (
            <article
              key={planIdStr(plan._id)}
              className={`billing-plan ${planIdStr(selectedPlan) === planIdStr(plan._id) ? "billing-plan--selected" : ""} ${plan.isPopular ? "billing-plan--popular" : ""}`}
            >
              {plan.isPopular && <span className="billing-plan__badge">Most popular</span>}
              <h3>{plan.name}</h3>
              <p className="billing-plan__desc">{plan.description}</p>
              <div className="billing-plan__price">
                <span>PKR {plan.price.toLocaleString()}</span>
                <small>{plan.periodLabel}</small>
              </div>
              <ul className="billing-plan__features">
                {(plan.features || []).slice(0, 6).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <button
                type="button"
                className={planIdStr(selectedPlan) === planIdStr(plan._id) ? "btn-primary btn--full" : "btn-ghost btn--full"}
                onClick={() => setSelectedPlan(planIdStr(plan._id))}
              >
                {planIdStr(selectedPlan) === planIdStr(plan._id) ? "Selected" : "Select plan"}
              </button>
            </article>
          ))}
        </div>
      )}

      <section className="content-card content-card--spaced billing-checkout">
        <h3 className="section-title-sm">Submit payment proof</h3>
        <p className="billing-checkout__hint">
          After sending payment using one of the accounts above, tell us which method you used and upload
          a screenshot of the successful transaction.
        </p>

        {!selectedPlanData && (
          <p className="billing-checkout__hint billing-checkout__hint--warn">
            Select a plan above so we know the amount you paid.
          </p>
        )}

        <div className="billing-providers">
          <button
            type="button"
            className={`billing-provider ${manualChannel === "jazzcash" ? "billing-provider--active" : ""}`}
            onClick={() => setManualChannel("jazzcash")}
            disabled={!paymentSettings?.jazzcashNumber?.trim?.()}
          >
            <Smartphone size={18} />
            I paid via JazzCash
          </button>
          <button
            type="button"
            className={`billing-provider ${manualChannel === "easypaisa" ? "billing-provider--active" : ""}`}
            onClick={() => setManualChannel("easypaisa")}
            disabled={!paymentSettings?.easypaisaNumber?.trim?.()}
          >
            <Smartphone size={18} />
            I paid via Easypaisa
          </button>
          <button
            type="button"
            className={`billing-provider ${manualChannel === "bank" ? "billing-provider--active" : ""}`}
            onClick={() => setManualChannel("bank")}
            disabled={
              !paymentSettings?.bankAccountNumber?.trim?.() &&
              !paymentSettings?.bankIban?.trim?.()
            }
          >
            <Building2 size={18} />
            I paid via bank
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="billing-txn-ref">Transaction ID / reference (optional)</label>
          <input
            id="billing-txn-ref"
            value={studentTxnReference}
            onChange={(e) => setStudentTxnReference(e.target.value)}
            placeholder="TID from JazzCash / Easypaisa / bank receipt"
          />
        </div>

        <div className="form-group">
          <label htmlFor="billing-screenshot">Payment screenshot</label>
          <div className="billing-upload">
            <input
              id="billing-screenshot"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              onChange={handleScreenshotChange}
              className="billing-upload__input"
            />
            <label htmlFor="billing-screenshot" className="billing-upload__label">
              <Upload size={18} />
              {screenshot ? screenshot.name : "Choose screenshot (max 5 MB)"}
            </label>
            {screenshotPreview && (
              <img src={screenshotPreview} alt="Payment preview" className="billing-upload__preview" />
            )}
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleManualSubmit}
          disabled={!canSubmit}
        >
          {submitting ? "Submitting…" : "Submit payment for review"}
        </button>
        {!canSubmit && !submitting && submitBlockers.length > 0 && (
          <p className="billing-checkout__hint billing-checkout__hint--warn">
            To submit: {submitBlockers.join(", ")}.
          </p>
        )}
      </section>

      <section className="content-card content-card--spaced billing-checkout billing-checkout--muted">
        <div className="billing-coming-soon">
          <Clock size={20} />
          <div>
            <h3 className="section-title-sm">Automatic JazzCash & Easypaisa</h3>
            <p className="billing-checkout__hint">
              Instant checkout is coming soon — business verification with JazzCash and Easypaisa is in
              progress. For now, please use manual payment above.
            </p>
          </div>
        </div>

        {autoEnabled && (
          <p className="billing-checkout__hint">
            <Sparkles size={14} /> Automatic checkout is enabled for testing. Contact admin if you see this
            in production.
          </p>
        )}
      </section>

      {payments.length > 0 && (
        <section className="billing-history">
          <h3 className="section-title-sm">Payment history</h3>
          <div className="data-list">
            {payments.map((p) => (
              <div key={p._id} className="data-row">
                <div className="data-row__main">
                  <p className="data-row__title">
                    {p.planId?.name || "Plan"} — PKR {p.amount}
                  </p>
                  <p className="data-row__sub">
                    {p.provider === "manual" ? `Manual (${p.manualChannel || "—"})` : p.provider} ·{" "}
                    {STATUS_LABELS[p.status] || p.status} · {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                  {p.status === "rejected" && p.rejectionReason && (
                    <p className="data-row__sub data-row__sub--danger">Reason: {p.rejectionReason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
