"use client";

import { useState } from "react";
import DataTable from "@/components/tables/DataTable";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBadge from "@/components/ui/StatusBadge";
import { FormInput, FormSelect } from "@/components/forms/FormFields";
import {
  testHooks,
  usePreviewPastPaperImport,
  useConfirmPastPaperImport,
} from "@/hooks/useResource";
import { Upload, ArrowRight } from "lucide-react";
import { getName, formatDate, truncate } from "@/lib/utils";

export default function PastPapersPage() {
  const [importOpen, setImportOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const [importFile, setImportFile] = useState(null);
  const [importMode, setImportMode] = useState("auto");
  const [importPreview, setImportPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [paperYear, setPaperYear] = useState("");
  const [duration, setDuration] = useState("210");

  const papers = testHooks.useList({ type: "pastPaper" });
  const removeMut = testHooks.useRemove();
  const previewMut = usePreviewPastPaperImport();
  const confirmMut = useConfirmPastPaperImport();

  const previewSections = importPreview?.sections || [];

  const resetImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportMode("auto");
    setTitle("");
    setPaperYear("");
    setDuration("210");
  };

  const closeImport = () => {
    setImportOpen(false);
    resetImport();
  };

  const handlePreview = async () => {
    if (!importFile) return alert("Choose a .txt, .docx, or .pdf file");

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("mode", importMode);

    try {
      const res = await previewMut.mutateAsync(formData);
      const preview = res?.data || res;
      setImportPreview(preview);

      if (preview?.detectedTitle) {
        setTitle((current) => current.trim() || preview.detectedTitle);
      }
      if (preview?.suggestedYear) {
        setPaperYear((current) => current || String(preview.suggestedYear));
      }
    } catch {}
  };

  const handleConfirm = async () => {
    if (!importPreview?.questions?.length) return;
    if (!title.trim()) return alert("Enter a paper title");

    try {
      await confirmMut.mutateAsync({
        title: title.trim(),
        paperYear: paperYear ? Number(paperYear) : null,
        duration: duration ? Number(duration) : null,
        questions: importPreview.questions,
      });
      closeImport();
    } catch {}
  };

  const columns = [
    { key: "title", label: "Title" },
    {
      key: "paperYear",
      label: "Year",
      render: (row) =>
        row.paperYear ? (
          <StatusBadge variant="info">{row.paperYear}</StatusBadge>
        ) : (
          "—"
        ),
    },
    {
      key: "subjectId",
      label: "Subject",
      render: (row) => getName(row.subjectId),
    },
    {
      key: "questions",
      label: "MCQs",
      render: (row) => row.questions?.length || row.questionCount || 0,
    },
    {
      key: "duration",
      label: "Duration",
      render: (row) => (row.duration ? `${row.duration} min` : "—"),
    },
    {
      key: "createdAt",
      label: "Uploaded",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "_actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => setConfirm({ open: true, id: row._id })}
          className="btn-ghost btn-sm text-danger"
        >
          Delete
        </button>
      ),
    },
  ];

  const items = papers.data?.data || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Past Papers</h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload a full MDCAT paper (.txt, .docx, or .pdf). Sections like BIOLOGY,
            PHYSICS, and CHEMISTRY are detected and matched to your subjects automatically.
          </p>
        </div>
        <button type="button" onClick={() => setImportOpen(true)} className="btn-primary">
          <Upload size={16} /> Upload Past Paper
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={papers.isLoading}
        error={papers.error}
        onRetry={papers.refetch}
      />

      <Modal open={importOpen} onClose={closeImport} title="Upload MDCAT Past Paper" size="xl">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-alt p-4 text-sm space-y-2">
            <p className="font-medium">KMU / MDCAT format</p>
            <p className="text-text-secondary">
              Paper title, then subject sections (BIOLOGY, PHYSICS, CHEMISTRY, ENGLISH,
              LOGICAL REASONING), then numbered MCQs with a–d options. No subject or
              chapter selection needed — we match sections to your subjects automatically.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Paper title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Auto-detected from file"
              required
            />
            <FormInput
              label="Year"
              name="paperYear"
              type="number"
              value={paperYear}
              onChange={(e) => setPaperYear(e.target.value)}
              placeholder="2025"
            />
            <FormInput
              label="Duration (minutes)"
              name="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="210"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Paper file
              </label>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx,text/plain"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null);
                  setImportPreview(null);
                }}
                className="input-base w-full"
              />
            </div>
            <FormSelect
              label="Import mode"
              name="importMode"
              value={importMode}
              onChange={(e) => {
                setImportMode(e.target.value);
                setImportPreview(null);
              }}
              options={[
                { value: "auto", label: "Auto (KMU format + AI fallback)" },
                { value: "structured", label: "Structured only" },
                { value: "ai", label: "AI parsing only" },
              ]}
            />
          </div>

          {importPreview && (
            <div className="rounded-lg border border-border p-4 space-y-4 bg-surface-alt">
              <div className="flex flex-wrap gap-2 items-center">
                <p className="text-sm font-medium">
                  {importPreview.previewCount} MCQs parsed via{" "}
                  <StatusBadge variant="info">{importPreview.method}</StatusBadge>
                </p>
                {importPreview.detectedTitle && (
                  <StatusBadge variant="purple">{importPreview.detectedTitle}</StatusBadge>
                )}
              </div>

              {previewSections.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Detected sections (auto-matched)</p>
                  <div className="flex flex-col gap-2">
                    {previewSections.map((section) => (
                      <div
                        key={section.name}
                        className="flex flex-wrap items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 bg-white"
                      >
                        <span className="font-semibold">{section.name}</span>
                        <span className="text-text-muted">{section.count} MCQs</span>
                        {section.subjectName && (
                          <>
                            <ArrowRight size={14} className="text-text-muted" />
                            <StatusBadge variant="success">{section.subjectName}</StatusBadge>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">
                    MCQs are stored under each subject&apos;s &quot;Past Papers&quot; bucket.
                    Chapters are not required for past paper uploads.
                  </p>
                </div>
              )}

              {importPreview.missingAnswerCount > 0 && (
                <p className="text-xs text-warning">
                  {importPreview.missingAnswerCount} questions have no answer key in the file.
                  Add an ANSWER KEY block at the end or update answers later in Questions.
                </p>
              )}

              {importPreview.errorCount > 0 && (
                <p className="text-xs text-warning">
                  {importPreview.errorCount} blocks skipped during parsing
                </p>
              )}

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(importPreview.sample || []).map((q, i) => (
                  <div key={i} className="text-sm border-b border-border pb-2">
                    <p className="font-medium">
                      [{q.section || "—"}] {truncate(q.text, 90)}
                    </p>
                    <p className="text-text-muted text-xs">
                      #{q.paperNumber || i + 1} · {q.options?.length || 0} options
                      {q.needsAnswerKey ? " · needs answer key" : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button type="button" onClick={closeImport} className="btn-secondary btn-sm">
              Cancel
            </button>
            {!importPreview ? (
              <button
                type="button"
                onClick={handlePreview}
                disabled={previewMut.isPending}
                className="btn-primary btn-sm"
              >
                {previewMut.isPending ? "Parsing…" : "Preview MCQs"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirmMut.isPending || !title.trim()}
                className="btn-primary btn-sm"
              >
                {confirmMut.isPending
                  ? "Publishing…"
                  : `Publish ${importPreview.previewCount} MCQs as past paper`}
              </button>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={async () => {
          await removeMut.mutateAsync(confirm.id);
          setConfirm({ open: false, id: null });
        }}
        loading={removeMut.isPending}
      />
    </div>
  );
}
