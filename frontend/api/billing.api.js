import client from "./client";

export const getPricingPlans = () => client.get("/pricing/plans");

export const getMySubscription = () => client.get("/billing/subscription/me");

export const getMyPayments = () => client.get("/billing/payments/me");

export const initiateCheckout = (data) => client.post("/billing/payments/checkout", data);

export const completeMockPayment = (paymentId) =>
  client.post("/billing/payments/mock-complete", { paymentId });

export const getPaymentStatus = (txnRef) =>
  client.get(`/billing/payments/status/${txnRef}`);
