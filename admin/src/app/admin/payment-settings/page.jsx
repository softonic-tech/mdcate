"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { paymentSettingsHooks } from "@/hooks/useResource";
import { FormInput, FormTextarea, FormCheckbox } from "@/components/forms/FormFields";
import toast from "react-hot-toast";

const emptyForm = {
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

export default function PaymentSettingsPage() {
  const { data, isLoading, isError } = paymentSettingsHooks.useGet();
  const updateMut = paymentSettingsHooks.useUpdate();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const settings = data?.data || data;
    if (settings) {
      setForm({
        jazzcashNumber: settings.jazzcashNumber || "",
        jazzcashAccountTitle: settings.jazzcashAccountTitle || "",
        easypaisaNumber: settings.easypaisaNumber || "",
        easypaisaAccountTitle: settings.easypaisaAccountTitle || "",
        bankName: settings.bankName || "",
        bankAccountTitle: settings.bankAccountTitle || "",
        bankAccountNumber: settings.bankAccountNumber || "",
        bankIban: settings.bankIban || "",
        manualInstructions: settings.manualInstructions || "",
        automaticPaymentsEnabled: Boolean(settings.automaticPaymentsEnabled),
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMut.mutateAsync(form);
      toast.success("Payment details updated");
    } catch {
      toast.error("Failed to save payment details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Payment settings</h1>
        <p className="text-text-muted mt-1">
          Manage JazzCash, Easypaisa, and bank account details shown to students for manual payments.
        </p>
      </div>

      {isError && (
        <p className="text-sm text-danger rounded-lg border border-danger/30 bg-danger/5 px-4 py-3">
          Could not load current settings. You can still enter details and save.
        </p>
      )}

      {isLoading && (
        <p className="text-sm text-text-muted">Loading current settings…</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 card p-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">JazzCash</h2>
            <FormInput
              label="Mobile number"
              name="jazzcashNumber"
              value={form.jazzcashNumber}
              onChange={handleChange}
              placeholder="03XX XXXXXXX"
            />
            <FormInput
              label="Account title (optional)"
              name="jazzcashAccountTitle"
              value={form.jazzcashAccountTitle}
              onChange={handleChange}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Easypaisa</h2>
            <FormInput
              label="Mobile number"
              name="easypaisaNumber"
              value={form.easypaisaNumber}
              onChange={handleChange}
              placeholder="03XX XXXXXXX"
            />
            <FormInput
              label="Account title (optional)"
              name="easypaisaAccountTitle"
              value={form.easypaisaAccountTitle}
              onChange={handleChange}
            />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Bank transfer</h2>
            <FormInput label="Bank name" name="bankName" value={form.bankName} onChange={handleChange} />
            <FormInput
              label="Account title"
              name="bankAccountTitle"
              value={form.bankAccountTitle}
              onChange={handleChange}
            />
            <FormInput
              label="Account number"
              name="bankAccountNumber"
              value={form.bankAccountNumber}
              onChange={handleChange}
            />
            <FormInput label="IBAN" name="bankIban" value={form.bankIban} onChange={handleChange} />
          </section>

          <FormTextarea
            label="Instructions for students (optional)"
            name="manualInstructions"
            value={form.manualInstructions}
            onChange={handleChange}
            rows={4}
            placeholder="e.g. Include your registered email in the payment note."
          />

          <FormCheckbox
            label="Enable automatic JazzCash / Easypaisa checkout (for testing — keep off until business verification is complete)"
            name="automaticPaymentsEnabled"
            checked={form.automaticPaymentsEnabled}
            onChange={handleChange}
          />

          <div className="flex justify-end pt-2 border-t border-border">
            <button type="submit" disabled={saving} className="btn-primary">
              <Save size={16} />
              {saving ? "Saving…" : "Save payment details"}
            </button>
          </div>
      </form>
    </div>
  );
}
