"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getPaymentStatus, getMySubscription } from "@/api/billing.api";
import { useAuth } from "@/context/AuthContext";

export default function BillingCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, user } = useAuth();
  const [state, setState] = useState("loading");

  const txnRef = searchParams.get("txnRef");
  const successParam = searchParams.get("success");

  useEffect(() => {
    const verify = async () => {
      try {
        if (txnRef) {
          await getPaymentStatus(txnRef);
        }
        const subRes = await getMySubscription();
        const sub = subRes?.data || subRes;
        if (user) {
          setUser({ ...user, subscription: sub });
        }

        const ok = successParam === "1" || sub?.status === "active";
        setState(ok ? "success" : "failed");
      } catch {
        setState(successParam === "1" ? "success" : "failed");
      }
    };

    verify();
  }, [txnRef, successParam, setUser, user]);

  return (
    <div className="page-shell study-page billing-callback">
      {state === "loading" && (
        <div className="billing-callback__card">
          <Loader2 className="spin" size={32} />
          <h1>Verifying payment…</h1>
        </div>
      )}

      {state === "success" && (
        <div className="billing-callback__card billing-callback__card--success">
          <CheckCircle2 size={40} />
          <h1>Payment successful</h1>
          <p>Your plan is now active. Enjoy full access to medprep.study.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to dashboard
          </Link>
        </div>
      )}

      {state === "failed" && (
        <div className="billing-callback__card billing-callback__card--failed">
          <XCircle size={40} />
          <h1>Payment not completed</h1>
          <p>Your payment was cancelled or failed. You can try again anytime.</p>
          <button type="button" className="btn-primary" onClick={() => router.push("/dashboard/billing")}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
