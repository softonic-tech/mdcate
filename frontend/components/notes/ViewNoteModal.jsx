"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import PdfModal from "../book/PdfModal";
import Modal from "@/components/dashboard/Modal";

const BASE_URL = "http://localhost:5000";

const getFileUrl = (url) => {
  if (!url) return "";
  const fixed = url.replace(/\\/g, "/");
  return fixed.startsWith("http") ? fixed : `${BASE_URL}/${fixed}`;
};

export default function ViewNoteModal({ note, onClose }) {
  const [zoom, setZoom] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  if (!note) return null;

  const handleOpenPdf = () => {
    if (note?.pdf?.url) {
      setPdfUrl(getFileUrl(note.pdf.url));
    }
  };

  const renderContent = () => {
    if (note?.image?.url) {
      return (
        <img
          src={getFileUrl(note.image.url)}
          alt={note.title || "Note image"}
          className="note-view__image"
          onClick={() => setZoom(true)}
        />
      );
    }

    if (note?.pdf?.url) {
      return (
        <button type="button" className="btn-primary note-view__pdf-btn" onClick={handleOpenPdf}>
          <FileText size={16} />
          Open PDF
        </button>
      );
    }

    if (note?.content) {
      return <div className="note-view__text">{note.content}</div>;
    }

    return <p className="text-muted">No content available</p>;
  };

  return (
    <>
      <Modal
        open={Boolean(note)}
        onClose={onClose}
        title={note.title}
        subtitle={`Subject: ${note.subjectId?.name || "N/A"}`}
        size="lg"
      >
        {renderContent()}
      </Modal>

      {zoom && note?.image?.url && (
        <div className="note-view__zoom" onClick={() => setZoom(false)} role="presentation">
          <img src={getFileUrl(note.image.url)} alt={note.title || "Note"} className="note-view__zoom-img" />
        </div>
      )}

      <PdfModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
    </>
  );
}
