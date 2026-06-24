import mongoose from "mongoose";

const paymentSettingsSchema = new mongoose.Schema(
  {
    jazzcashNumber: { type: String, default: "" },
    jazzcashAccountTitle: { type: String, default: "" },
    easypaisaNumber: { type: String, default: "" },
    easypaisaAccountTitle: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccountTitle: { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankIban: { type: String, default: "" },
    manualInstructions: { type: String, default: "" },
    automaticPaymentsEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentSettings", paymentSettingsSchema);
