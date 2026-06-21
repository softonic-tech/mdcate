"use client";

export default function PdfModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div
      className="pdf-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        overflowY: "auto",
        padding: "1rem",
      }}
    >
      <div
        className="pdf-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "900px",
          height: "90vh",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#ff5f5f",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          ✕
        </button>

        {/* PDF Viewer */}
        <iframe
          src={url}
          title="PDF Viewer"
          style={{
            flex: 1,
            border: "none",
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      <style jsx>{`
        /* Styled Scrollbar for PDF iframe */
        .pdf-modal iframe::-webkit-scrollbar {
          width: 8px;
        }
        .pdf-modal iframe::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}