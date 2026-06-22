
"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import PdfModal from "@/components/book/PdfModal";
import AlertDialog from "@/components/dashboard/AlertDialog";

export default function BookCard({ book }) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const imageSrc =
    book.coverImage && book.coverImage !== ""
      ? book.coverImage
      : "/images/default-book.jpg";

 const handleDownload = async () => {
  try {
    setDownloading(true);
    setDownloadError(false);

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/books/download/${book._id}`,
      "_blank"
    );
  } catch (err) {
    console.error("Download error:", err);
    setDownloadError(true);
  } finally {
    setDownloading(false);
  }
};


  return (
    <>
      <div className="book-card">
        <div className="book-card__image">
          <img
            src={imageSrc}
            alt={book.title}
            onError={(e) => {
              e.target.src = "/images/default.jpeg";
            }}
          />
        </div>

        <div className="book-card__body">
          <h3>{book.title}</h3>
          <p>{book.subjectId?.name}</p>


          <div className="book-card__footer">
            <span className="board-badge">{book.board}</span>

            <div className="btn-group">
              {/* View PDF Modal */}
              <button className="view-btn" onClick={() => setOpen(true)}>
                View
              </button>

              {/* Direct Download */}
              <button
                className="download-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

     <PdfModal 
  url={open ? `${process.env.NEXT_PUBLIC_API_URL}/books/view/${book._id}` : null} 
  onClose={() => setOpen(false)} 
/>

      <AlertDialog
        open={downloadError}
        onClose={() => setDownloadError(false)}
        title="Download failed"
        message="We couldn't start the download. Please check your connection and try again."
        okLabel="OK"
        variant="danger"
      />
    </>
  );
}