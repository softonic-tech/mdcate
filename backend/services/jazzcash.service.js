import env from "../config/env.config.js";
import {
  amountToJazzCashPaisa,
  formatTxnDateTime,
  generateJazzCashHash,
} from "../utils/paymentHash.util.js";

const isConfigured = () =>
  Boolean(
    env.JAZZCASH_MERCHANT_ID &&
      env.JAZZCASH_PASSWORD &&
      env.JAZZCASH_INTEGRITY_SALT
  );

export const jazzcashConfigured = isConfigured;

export const buildJazzCashCheckout = ({ txnRef, amountPkr, description, mobileNumber }) => {
  if (!isConfigured()) {
    return { mock: true };
  }

  const txnDateTime = formatTxnDateTime();
  const expiry = formatTxnDateTime(new Date(Date.now() + 60 * 60 * 1000));

  const fields = {
    pp_Version: "2.0",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: env.JAZZCASH_MERCHANT_ID,
    pp_SubMerchantID: env.JAZZCASH_SUB_MERCHANT_ID || "",
    pp_Password: env.JAZZCASH_PASSWORD,
    pp_BankID: "TBANK",
    pp_ProductID: "RETL",
    pp_TxnRefNo: txnRef,
    pp_Amount: amountToJazzCashPaisa(amountPkr),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: txnRef,
    pp_Description: description.slice(0, 200),
    pp_TxnExpiryDateTime: expiry,
    pp_ReturnURL: `${env.FRONTEND_URL}/dashboard/billing/callback?provider=jazzcash`,
    ppmpf_1: mobileNumber || "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
  };

  fields.pp_SecureHash = generateJazzCashHash(fields, env.JAZZCASH_INTEGRITY_SALT);

  const actionUrl =
    env.JAZZCASH_CHECKOUT_URL ||
    (env.NODE_ENV === "production"
      ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
      : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/");

  return {
    mock: false,
    method: "POST",
    actionUrl,
    fields,
  };
};

export const verifyJazzCashCallback = (body) => {
  if (!isConfigured()) return { valid: false, reason: "not_configured" };

  const receivedHash = body.pp_SecureHash;
  const computed = generateJazzCashHash(body, env.JAZZCASH_INTEGRITY_SALT);

  if (receivedHash?.toLowerCase() !== computed.toLowerCase()) {
    return { valid: false, reason: "invalid_hash" };
  }

  const success = body.pp_ResponseCode === "000" || body.pp_ResponseMessage === "Success";
  return {
    valid: true,
    success,
    txnRef: body.pp_TxnRefNo,
    gatewayTxnId: body.pp_TxnRefNo,
    response: body,
    failureReason: success ? null : body.pp_ResponseMessage || body.pp_ResponseCode,
  };
};
