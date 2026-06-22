"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CreditCard, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";
import {
  getPricingPlans,
  getMySubscription,
  getMyPayments,
  initiateCheckout,
  completeMockPayment,
} from "@/api/billing.api";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/context/AuthContext";

const normalizePlans = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

function GatewayForm({ checkout, onSubmitted }) {
  const formRef = useRef(null);

  useEffect(() => {
    if (checkout?.actionUrl && formRef.current) {
      onSubmitted?.();
      formRef.current.submit();
    }
  }, [checkout, onSubmitted]);

  if (!checkout) return null;

  return (
    <form ref={formRef} method={checkout.method || "POST"} action={checkout.actionUrl} className="hidden">
      {Object.entries(checkout.fields || {}).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value ?? ""} />
      ))}
    </form>
  );
}

export default function BillingPage() {
  const { user, setUser } = useAuth();
  const searchParams = useSearchParams();
  const preselectedPlan = searchParams.get("plan");

  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [provider, setProvider] = useState("jazzcash");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [mockPaymentId, setMockPaymentId] = useState(null);

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

      if (preselectedPlan) {
        const match = planList.find((p) => p.slug === preselectedPlan);
        if (match) setSelectedPlan(match._id);
      }
    } catch {
      toast.error("Failed to load billing info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [preselectedPlan]);

  const handlePay = async () => {
    if (!selectedPlan) return toast.error("Select a plan");
    if (!mobileNumber.trim()) return toast.error("Enter your JazzCash / Easypaisa mobile number");

    try {
      setPaying(true);
      const res = await initiateCheckout({
        planId: selectedPlan,
        provider,
        mobileNumber: mobileNumber.trim(),
      });
      const data = res?.data || res;

      if (data.mock) {
        setMockPaymentId(data.paymentId);
        toast("Sandbox mode — complete test payment below", { icon: "🧪" });
        return;
      }

      setCheckout(data.checkout);
    } catch (err) {
      toast.error(err?.message || "Could not start payment");
    } finally {
      setPaying(false);
    }
  };

  const handleMockComplete = async () => {
    try {
      setPaying(true);
      await completeMockPayment(mockPaymentId);
      toast.success("Plan activated (sandbox)");
      setMockPaymentId(null);
      await load();
      if (user) {
        setUser({
          ...user,
          subscription: { ...(user.subscription || {}), status: "active", needsUpgrade: false },
        });
      }
    } catch {
      toast.error("Mock payment failed");
    } finally {
      setPaying(false);
    }
  };

  const paidPlans = plans;

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: CreditCard, label: "Billing" }}
        title="Upgrade Your Plan"
        description="Pay securely with JazzCash or Easypaisa. All prices are in PKR."
      />

      {subscription && (
        <section className="content-card content-card--spaced billing-status">
          <div className="billing-status__row">
            <div>
              <p className="billing-status__label">Current status</p>
              <h2 className="billing-status__value">
                {subscription.status === "trialing" && "Free trial"}
                {subscription.status === "active" && "Active subscription"}
                {subscription.status === "expired" && "Trial expired — upgrade required"}
                {subscription.status === "cancelled" && "Cancelled"}
              </h2>
              {subscription.daysRemaining != null && (
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

      {loading ? (
        <p className="text-muted">Loading plans…</p>
      ) : paidPlans.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No paid plans available"
          description="Ask an admin to configure pricing plans."
        />
      ) : (
        <div className="billing-grid">
          {paidPlans.map((plan) => (
            <article
              key={plan._id}
              className={`billing-plan ${selectedPlan === plan._id ? "billing-plan--selected" : ""} ${plan.isPopular ? "billing-plan--popular" : ""}`}
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
                className={selectedPlan === plan._id ? "btn-primary btn--full" : "btn-ghost btn--full"}
                onClick={() => setSelectedPlan(plan._id)}
              >
                {selectedPlan === plan._id ? "Selected" : "Select plan"}
              </button>
            </article>
          ))}
        </div>
      )}

      <section className="content-card content-card--spaced billing-checkout">
        <h3 className="section-title-sm">Payment method</h3>
        <p className="billing-checkout__hint">
          We only accept mobile wallets — no cards or bank transfers on this checkout.
        </p>

        <div className="billing-providers">
          <button
            type="button"
            className={`billing-provider ${provider === "jazzcash" ? "billing-provider--active" : ""}`}
            onClick={() => setProvider("jazzcash")}
          >
            <Smartphone size={18} />
            JazzCash
          </button>
          <button
            type="button"
            className={`billing-provider ${provider === "easypaisa" ? "billing-provider--active" : ""}`}
            onClick={() => setProvider("easypaisa")}
          >
            <Smartphone size={18} />
            Easypaisa
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="billing-mobile">Mobile number (03XXXXXXXXX)</label>
          <input
            id="billing-mobile"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="03XX XXXXXXX"
            inputMode="tel"
          />
        </div>

        <button type="button" className="btn-primary" onClick={handlePay} disabled={paying || !selectedPlan}>
          {paying ? "Processing…" : `Pay with ${provider === "jazzcash" ? "JazzCash" : "Easypaisa"}`}
        </button>

        {mockPaymentId && (
          <div className="billing-mock">
            <p>
              <Sparkles size={16} /> Gateway credentials are not configured. Use sandbox test payment:
            </p>
            <button type="button" className="btn-ghost" onClick={handleMockComplete} disabled={paying}>
              Complete sandbox payment
            </button>
          </div>
        )}
      </section>

      {payments.length > 0 && (
        <section className="billing-history">
          <h3 className="section-title-sm">Payment history</h3>
          <div className="data-list">
            {payments.map((p) => (
              <div key={p._id} className="data-row">
                <div className="data-row__main">
                  <p className="data-row__title">{p.planId?.name || "Plan"} — PKR {p.amount}</p>
                  <p className="data-row__sub">
                    {p.provider} · {p.status} · {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <GatewayForm checkout={checkout} />
    </div>
  );
}
