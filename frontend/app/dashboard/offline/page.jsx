"use client";

import { useState, useEffect } from "react";
import { getOfflineContent, deleteOfflineContent } from "@/api/offlineContent.api";
import toast from "react-hot-toast";
import { Download } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatStrip, ListMeta } from "@/components/dashboard/StudyPageUI";

export default function OfflinePage() {
  const [content, setContent] = useState([]);

  const load = () =>
    getOfflineContent()
      .then((r) => setContent(r?.data || []))
      .catch(() => setContent([]));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    await deleteOfflineContent(id);
    toast.success("Removed");
    load();
  };

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Download, label: "Offline" }}
        title="Offline Downloads"
        description="Content saved on your device for study without internet."
      />

      {content.length === 0 ? (
        <EmptyState
          icon={Download}
          title="No offline content"
          description="Download tests, notes, or flashcards to access them offline."
        />
      ) : (
        <>
          <StatStrip items={[{ label: "Downloaded items", value: content.length }]} />
          <ListMeta end={content.length} label="items" />
          <div className="data-list">
          {content.map((c) => (
            <div key={c._id} className="data-row">
              <div className="data-row__main">
                <p className="data-row__title">{c.contentType}</p>
                <p className="data-row__sub">
                  Downloaded: {new Date(c.downloadedAt).toLocaleDateString()}
                </p>
              </div>
              <button type="button" className="btn-danger btn-ghost" onClick={() => remove(c._id)}>
                Remove
              </button>
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
