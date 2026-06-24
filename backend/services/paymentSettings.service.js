import PaymentSettings from "../models/paymentSettings.model.js";

const DEFAULTS = {
  jazzcashNumber: "",
  jazzcashAccountTitle: "",
  easypaisaNumber: "",
  easypaisaAccountTitle: "",
  bankName: "",
  bankAccountTitle: "",
  bankAccountNumber: "",
  bankIban: "",
  manualInstructions: "",
  automaticPaymentsEnabled: false,
};

export const getOrCreatePaymentSettings = async () => {
  let settings = await PaymentSettings.findOne();
  if (!settings) {
    settings = await PaymentSettings.create(DEFAULTS);
  }
  return settings;
};

export const getPublicPaymentSettingsService = async () => {
  const settings = await getOrCreatePaymentSettings();
  return {
    jazzcashNumber: settings.jazzcashNumber,
    jazzcashAccountTitle: settings.jazzcashAccountTitle,
    easypaisaNumber: settings.easypaisaNumber,
    easypaisaAccountTitle: settings.easypaisaAccountTitle,
    bankName: settings.bankName,
    bankAccountTitle: settings.bankAccountTitle,
    bankAccountNumber: settings.bankAccountNumber,
    bankIban: settings.bankIban,
    manualInstructions: settings.manualInstructions,
    automaticPaymentsEnabled: settings.automaticPaymentsEnabled,
  };
};

export const updatePaymentSettingsService = async (payload) => {
  const settings = await getOrCreatePaymentSettings();
  const fields = [
    "jazzcashNumber",
    "jazzcashAccountTitle",
    "easypaisaNumber",
    "easypaisaAccountTitle",
    "bankName",
    "bankAccountTitle",
    "bankAccountNumber",
    "bankIban",
    "manualInstructions",
    "automaticPaymentsEnabled",
  ];

  for (const key of fields) {
    if (payload[key] !== undefined) {
      settings[key] = payload[key];
    }
  }

  await settings.save();
  return getPublicPaymentSettingsService();
};
