
"use client";

import { useState } from "react";
import PdfModal from "../book/PdfModal";

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

  // ================= OPEN PDF =================
  const handleOpenPdf = () => {
    if (note?.pdf?.url) {
      const fullUrl = getFileUrl(note.pdf.url);
      setPdfUrl(fullUrl); // ✅ ONLY FILE URL
    }
  };

  // ================= CONTENT =================
  const renderContent = () => {
    // IMAGE
    if (note?.image?.url) {
      return (
        <img
          src={getFileUrl(note.image.url)}
          alt="note"
          onClick={() => setZoom(true)}
          style={{
            width: "100%",
            borderRadius: 10,
            cursor: "zoom-in",
          }}
        />
      );
    }

    // PDF
    if (note?.pdf?.url) {
      return (
        <button onClick={handleOpenPdf} style={styles.pdfBtn}>
          📄 Open PDF
        </button>
      );
    }

    // TEXT
    if (note?.content) {
      return (
        <div style={styles.text}>
          {note.content}
        </div>
      );
    }

    return <p style={{ color: "#9ca3af" }}>No content available</p>;
  };

  return (
    <>
      {/* MAIN MODAL */}
      <div style={styles.overlay}>
        <div style={styles.modal}>

          {/* HEADER */}
          <div style={styles.header}>
            <h3>{note.title}</h3>
            <button onClick={onClose}>✖</button>
          </div>

          {/* SUBJECT */}
          <p style={styles.meta}>
            Subject: {note.subjectId?.name || "N/A"}
          </p>

          {/* BODY */}
          <div>{renderContent()}</div>

        </div>

        {/* IMAGE ZOOM */}
        {zoom && note?.image?.url && (
          <div style={styles.zoom} onClick={() => setZoom(false)}>
            <img src={getFileUrl(note.image.url)} style={styles.zoomImg} />
          </div>
        )}
      </div>

      {/* PDF MODAL */}
      <PdfModal url={pdfUrl} onClose={() => setPdfUrl(null)} />
    </>
  );
}

/* ================= STYLES ================= */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modal: {
    width: "70%",
    maxHeight: "90vh",
    background: "#0f172a",
    borderRadius: 12,
    padding: 16,
    overflowY: "auto",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  meta: {
    color: "#9ca3af",
    fontSize: 14,
  },

  text: {
    whiteSpace: "pre-wrap",
    color: "#e5e7eb",
  },

  pdfBtn: {
    padding: "10px 14px",
    background: "#2563eb",
    color: "#fff",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },

  zoom: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  zoomImg: {
    maxWidth: "90%",
    maxHeight: "90%",
  },
};