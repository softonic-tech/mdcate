
"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
export default function AddNoteModal({
  open,
  onClose,
  onSubmit,
  note,
  subjects,
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    type: "formula",
    content: "",
    isPublic: false,
    image: null,
    pdf: null,
  });

  useEffect(() => {
    if (note) {
      setForm({
        title: note.title || "",
        subjectId: note.subjectId?._id || note.subjectId || "",
        type: note.type || "formula",
        content: note.content || "",
        isPublic: note.isPublic || false,
        image: null,
        pdf: null,
      });
    } else {
      setForm({
        title: "",
        subjectId: subjects?.[0]?._id || "",
        type: "formula",
        content: "",
        isPublic: false,
        image: null,
        pdf: null,
      });
    }

    setStep(1);
    setError("");
  }, [note, subjects]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setForm({
      ...form,
      [name]: files ? files[0] : type === "checkbox" ? checked : value,
    });
  };


 const nextStep = () => {
  setError("");

  // STEP 1 validation
  if (step === 1) {
    if (!form.title.trim() || !form.subjectId) {
      setError("Title and Subject are required");
      return;
    }
  }

  // STEP 2 validation (THIS IS YOUR REQUIRED LOGIC)
  if (step === 2) {
    if (!form.content.trim() && !form.image && !form.pdf) {
      setError("Please add text OR image OR PDF");
      return;
    }
  }

  setStep((prev) => prev + 1);
};
const handleSubmit = async () => {
  try {
    setError("");

    const hasContent = !!form.content.trim();
    const hasImage = !!form.image;
    const hasPdf = !!form.pdf;

    const count = [hasContent, hasImage, hasPdf]
      .filter(Boolean).length;

    if (count === 0) {
      const msg = "Please add text OR image OR PDF";

      setError(msg);
      toast.error(msg);

      return;
    }

    if (count > 1) {
      const msg = "Only ONE type allowed";

      setError(msg);
      toast.error(msg);

      return;
    }

    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("subjectId", form.subjectId);
    formData.append("type", form.type);
    formData.append("isPublic", form.isPublic);

    if (form.content.trim()) {
      formData.append("content", form.content);
    }

    if (form.image) {
      formData.append("image", form.image);
    }

    if (form.pdf) {
      formData.append("pdf", form.pdf);
    }

    await onSubmit(formData);

    toast.success(
      note
        ? "Note updated successfully"
        : "Note created successfully"
    );

    // ✅ FORM RESET
    resetForm();

    // ✅ CLOSE MODAL
    onClose();

  } catch (err) {
    console.log(err);

    const message =
      err?.response?.data?.message ||
      "Failed to save note";

    setError(message);

    // ❌ SINGLE ERROR TOAST ONLY
    toast.error(message);
  }
};
const resetForm = () => {
  setForm({
    title: "",
    subjectId: subjects?.[0]?._id || "",
    type: "formula",
    content: "",
    isPublic: false,
    image: null,
    pdf: null,
  });

  setStep(1);
  setError("");
};
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2>{note ? "Edit Note" : "Create Note"}</h2>
          <span style={styles.step}>Step {step} / 3</span>
        </div>

        {/* ERROR */}
        {error && <div style={styles.error}>{error}</div>}

        {/* BODY */}
        <div style={styles.body}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                name="title"
                placeholder="Note title"
                value={form.title}
                onChange={handleChange}
                style={styles.input}
              />

              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="formula">Formula</option>
                <option value="shortcut">Shortcut</option>
                <option value="summary">Summary</option>
                <option value="general">General</option>
              </select>
            </>
          )}

          {/* STEP 2 (FIXED LAYOUT + NO OVERFLOW) */}
          {/* {step === 2 && (
            <div style={styles.step2}>

              <div style={styles.uploadTitle}>
                📝 Write Note OR Upload File
              </div>

              <textarea
                name="content"
                placeholder="Write your note..."
                value={form.content}
                onChange={handleChange}
                style={styles.textarea}
              />

              <div style={styles.uploadRow}>

                <div style={styles.uploadBox}>
                  <label>Image</label>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} />
                  {form.image && <small>{form.image.name}</small>}
                </div>

                <div style={styles.uploadBox}>
                  <label>PDF</label>
                  <input type="file" name="pdf" accept="application/pdf" onChange={handleChange} />
                  {form.pdf && <small>{form.pdf.name}</small>}
                </div>

              </div>

            </div>
          )} */}
          {step === 2 && (
  <div style={styles.step2}>
    <div style={styles.uploadTitle}>
      📝 Write Note OR Upload File
    </div>

    <textarea
      name="content"
      placeholder="Write your note..."
      value={form.content}
      onChange={handleChange}
      disabled={!!form.image || !!form.pdf}
      style={{
        ...styles.textarea,
        opacity: !!form.image || !!form.pdf ? 0.5 : 1,
      }}
    />

    <div style={styles.uploadRow}>
      <div style={styles.uploadBox}>
        <label>Image</label>

        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          disabled={
            !!form.content.trim() || !!form.pdf
          }
        />

        {form.image && (
          <small>{form.image.name}</small>
        )}
      </div>

      <div style={styles.uploadBox}>
        <label>PDF</label>

        <input
          type="file"
          name="pdf"
          accept="application/pdf"
          onChange={handleChange}
          disabled={
            !!form.content.trim() || !!form.image
          }
        />

        {form.pdf && (
          <small>{form.pdf.name}</small>
        )}
      </div>
    </div>
  </div>
)}

          {/* STEP 3 (PUBLIC ONLY + CLEAN UI) */}
          {step === 3 && (
            <div style={styles.step3}>

              <h3>Final Step</h3>

              <label style={styles.publicBox}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={form.isPublic}
                  onChange={handleChange}
                />
                Make this note public (optional)
              </label>

              <p style={styles.note}>
                Public notes will be visible to all users.
              </p>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div style={styles.footer}>

          {step === 1 ? (
          <button
            onClick={onClose}
            style={styles.secondary}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={styles.secondary}
          >
            Back
          </button>
        )}

          {step < 3 ? (
            <button onClick={nextStep} style={styles.primary}>
              Next
            </button>
          ) : (
           <button
            onClick={handleSubmit}
            style={{
              ...styles.primary,
              opacity: (!form.title || (!form.content && !form.image && !form.pdf)) ? 0.5 : 1,
              cursor: (!form.title || (!form.content && !form.image && !form.pdf)) ? "not-allowed" : "pointer",
            }}
            disabled={!form.title || (!form.content && !form.image && !form.pdf)}
          >
            Save Note
          </button>
          )}

        </div>

      </div>
    </div>
  );
}

/* ================= IMPROVED STYLES ================= */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "700px", // ✅ increased width
    maxHeight: "90vh",
    overflowY: "auto", // ✅ scroll fix
    background: "#0f172a",
    borderRadius: 12,
  },

  header: {
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #1e293b",
    color: "#fff",
  },

  step: {
    fontSize: 13,
    color: "#94a3b8",
  },

  body: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#fff",
  },

  textarea: {
    padding: 12,
    borderRadius: 8,
    background: "#1e293b",
    border: "1px solid #334155",
    color: "#fff",
    minHeight: 120,
  },

  step2: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  uploadTitle: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: 500,
  },

  uploadRow: {
    display: "flex",
    gap: 12,
  },

  uploadBox: {
    flex: 1,
    background: "#1e293b",
    padding: 10,
    borderRadius: 8,
    color: "#cbd5e1",
  },

  step3: {
    textAlign: "center",
    color: "#fff",
  },

  publicBox: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    marginTop: 20,
    color: "#cbd5e1",
  },

  note: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 10,
  },

  error: {
    background: "#7f1d1d",
    color: "#fff",
    padding: 10,
    fontSize: 13,
  },

  footer: {
    padding: 16,
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #1e293b",
  },

  primary: {
    padding: "8px 14px",
    background: "#2563eb",
    color: "#fff",
    borderRadius: 6,
    border: "none",
  },

  secondary: {
    padding: "8px 14px",
    background: "#334155",
    color: "#fff",
    borderRadius: 6,
    border: "none",
  },
};