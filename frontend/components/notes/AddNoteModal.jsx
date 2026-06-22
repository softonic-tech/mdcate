"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CustomSelect } from "@/components/dashboard/CustomSelect";
import Modal from "@/components/dashboard/Modal";

export default function AddNoteModal({ open, onClose, onSubmit, note, subjects }) {
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

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : type === "checkbox" ? checked : value,
    });
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

  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (!form.title.trim() || !form.subjectId) {
        setError("Title and subject are required");
        return;
      }
    }

    if (step === 2) {
      if (!form.content.trim() && !form.image && !form.pdf) {
        setError("Please add text, an image, or a PDF");
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
      const count = [hasContent, hasImage, hasPdf].filter(Boolean).length;

      if (count === 0) {
        const msg = "Please add text, an image, or a PDF";
        setError(msg);
        toast.error(msg);
        return;
      }

      if (count > 1) {
        const msg = "Only one content type is allowed";
        setError(msg);
        toast.error(msg);
        return;
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subjectId", form.subjectId);
      formData.append("type", form.type);
      formData.append("isPublic", form.isPublic);

      if (form.content.trim()) formData.append("content", form.content);
      if (form.image) formData.append("image", form.image);
      if (form.pdf) formData.append("pdf", form.pdf);

      await onSubmit(formData);
      toast.success(note ? "Note updated successfully" : "Note created successfully");
      resetForm();
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save note";
      setError(message);
      toast.error(message);
    }
  };

  const canSave = Boolean(form.title && (form.content?.trim() || form.image || form.pdf));
  const stepLabel =
    step === 1 ? "Details" : step === 2 ? "Content" : "Visibility";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={note ? "Edit Note" : "Create Note"}
      subtitle={`Step ${step} of 3 — ${stepLabel}`}
      size="xl"
      footer={
        <>
          {step === 1 ? (
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" className="btn-primary" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!canSave}
            >
              Save Note
            </button>
          )}
        </>
      }
    >
      <div className="modal-steps" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`modal-step${
              step === n ? " modal-step--active" : step > n ? " modal-step--done" : ""
            }`}
          />
        ))}
      </div>

      {error ? <div className="modal-alert">{error}</div> : null}

      {step === 1 && (
        <>
          <div className="form-group">
            <label htmlFor="note-title">Title</label>
            <input
              id="note-title"
              name="title"
              placeholder="e.g. Photosynthesis summary"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="note-subject">Subject</label>
            <CustomSelect
              id="note-subject"
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </CustomSelect>
          </div>

          <div className="form-group">
            <label htmlFor="note-type">Type</label>
            <CustomSelect id="note-type" name="type" value={form.type} onChange={handleChange}>
              <option value="formula">Formula</option>
              <option value="shortcut">Shortcut</option>
              <option value="summary">Summary</option>
              <option value="general">General</option>
            </CustomSelect>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="form-section-title">Write text or upload one file</p>
          <p className="form-hint form-hint--below-title">
            Choose only one: text, image, or PDF.
          </p>

          <div className="form-group">
            <label htmlFor="note-content">Note text</label>
            <textarea
              id="note-content"
              name="content"
              placeholder="Write your note here…"
              value={form.content}
              onChange={handleChange}
              disabled={Boolean(form.image || form.pdf)}
            />
          </div>

          <div className="form-upload-grid">
            <div className="form-upload-box">
              <label htmlFor="note-image">Image</label>
              <input
                id="note-image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                disabled={Boolean(form.content.trim() || form.pdf)}
              />
              {form.image ? <span className="form-upload-box__name">{form.image.name}</span> : null}
            </div>

            <div className="form-upload-box">
              <label htmlFor="note-pdf">PDF</label>
              <input
                id="note-pdf"
                type="file"
                name="pdf"
                accept="application/pdf"
                onChange={handleChange}
                disabled={Boolean(form.content.trim() || form.image)}
              />
              {form.pdf ? <span className="form-upload-box__name">{form.pdf.name}</span> : null}
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="form-section-title">Sharing</p>
          <label className="form-check">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
            />
            <span className="form-check__text">
              <span className="form-check__label">Make this note public</span>
              <span className="form-check__hint">
                Public notes are visible to all students on the platform.
              </span>
            </span>
          </label>
        </>
      )}
    </Modal>
  );
}
