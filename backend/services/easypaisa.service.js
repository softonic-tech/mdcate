import env from "../config/env.config.js";
import { formatEasypaisaExpiry, generateEasypaisaHash } from "../utils/paymentHash.util.js";

const isConfigured = () =>
  Boolean(env.EASYPAISA_STORE_ID && env.EASYPAISA_HASH_KEY);

export const easypaisaConfigured = isConfigured;

export const buildEasypaisaCheckout = ({
  txnRef,
  amountPkr,
  email,
  mobileNumber,
}) => {
  if (!isConfigured()) {
    return { mock: true };
  }

  const payload = {
    amount: Number(amountPkr).toFixed(1),
    autoRedirect: "1",
    emailAddr: email || "customer@medprep.study",
    mobileNum: mobileNumber || "03000000000",
    orderRefNum: txnRef,
    paymentMethod: "MA",
    postBackURL: `${env.BACKEND_URL || `http://localhost:${env.PORT}`}/api/v1/payments/easypaisa/callback`,
    storeId: env.EASYPAISA_STORE_ID,
    expiryDate: formatEasypaisaExpiry(),
  };

  const merchantHashedReq = generateEasypaisaHash(payload, env.EASYPAISA_HASH_KEY);

  const actionUrl =
    env.EASYPAISA_CHECKOUT_URL ||
    (env.NODE_ENV === "production"
      ? "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
      : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf");

  return {
    mock: false,
    method: "POST",
    actionUrl,
    fields: {
      ...payload,
      merchantHashedReq,
    },
  };
};

export const verifyEasypaisaCallback = (query) => {
  const status = query.status || query.Status;
  const success =
    status === "0000" ||
    status === "Paid" ||
    query.responseCode === "0000";

  return {
    valid: true,
    success,
    txnRef: query.orderRefNum || query.orderId,
    gatewayTxnId: query.transactionId || query.orderRefNum,
    response: query,
    failureReason: success ? null : query.responseDesc || query.status,
  };
};
