"use client";

import { useCallback, useEffect, useState } from "react";
import { getChapterVideoStream, getChapterVideos } from "@/api/chapterVideo.api";
import { getSubjectsApi } from "@/api/subject.api";
import { getChaptersBySubjectApi } from "@/api/chapter.api";
import { getBooks } from "@/api/book.api";
import toast from "react-hot-toast";
import { Play, BookOpen, Layers, Video } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonCardGrid, SkeletonMeta, SkeletonVideoPlayer } from "@/components/dashboard/Skeleton";
import {
  FilterPanel,
  FilterField,
  FilterRow,
  ListMeta,
} from "@/components/dashboard/StudyPageUI";

const normalizeList = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

export default function ChapterVideosPage() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [books, setBooks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState(null);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamLoading, setStreamLoading] = useState(false);

  useEffect(() => {
    getSubjectsApi()
      .then((res) => setSubjects(normalizeList(res)))
      .catch(() => setSubjects([]));
    getBooks({ limit: 200 })
      .then((res) => setBooks(res?.data || []))
      .catch(() => setBooks([]));
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setChapters([]);
      setChapterId("");
      return;
    }
    getChaptersBySubjectApi(subjectId)
      .then((res) => setChapters(normalizeList(res)))
      .catch(() => setChapters([]));
  }, [subjectId]);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (subjectId) params.subjectId = subjectId;
      if (chapterId) params.chapterId = chapterId;
      if (bookId) params.bookId = bookId;

      const res = await getChapterVideos(params);
      setVideos(normalizeList(res));
    } catch (error) {
      toast.error(error?.message || "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, chapterId, bookId]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const openPlayer = async (video) => {
    setPlayer(video);
    setStreamUrl("");
    setStreamLoading(true);
    try {
      const res = await getChapterVideoStream(video._id);
      setStreamUrl(res?.data?.streamUrl || "");
    } catch (error) {
      toast.error(error?.message || "Could not load video");
      setPlayer(null);
    } finally {
      setStreamLoading(false);
    }
  };

  const filteredBooks = books.filter(
    (book) => !subjectId || String(book.subjectId?._id || book.subjectId) === subjectId
  );

  const hasActiveFilters = Boolean(subjectId || chapterId || bookId);

  const clearFilters = () => {
    setSubjectId("");
    setChapterId("");
    setBookId("");
  };

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Video, label: "Video Lectures" }}
        title="Chapter Video Lectures"
        description="Watch chapter-wise explanations organized by subject, chapter, and book."
      />

      <FilterPanel
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        ariaLabel="Filter videos"
      >
        <FilterRow>
          <FilterField label="Subject" icon={BookOpen}>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setChapterId("");
                setBookId("");
              }}
              aria-label="Filter by subject"
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.board})
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField label="Chapter" icon={Layers}>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={!subjectId}
              aria-label="Filter by chapter"
            >
              <option value="">All chapters</option>
              {chapters.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </FilterField>
        </FilterRow>
        <FilterRow>
          <FilterField label="Book" icon={BookOpen}>
            <select value={bookId} onChange={(e) => setBookId(e.target.value)} aria-label="Filter by book">
              <option value="">All books</option>
              {filteredBooks.map((b) => (
                <option key={b._id} value={b._id}>{b.title}</option>
              ))}
            </select>
          </FilterField>
        </FilterRow>
      </FilterPanel>

      {player && (
        <div className="content-card video-panel">
          <div className="video-panel__head">
            <div>
              <h2 className="video-panel__title">{player.title}</h2>
              <p className="video-panel__meta">
                {player.chapterId?.name || "Chapter"} · {player.subjectId?.name || "Subject"}
                {player.bookId?.title ? ` · ${player.bookId.title}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPlayer(null);
                setStreamUrl("");
              }}
              className="btn-ghost"
            >
              Close
            </button>
          </div>

          {player.description && <p className="video-panel__desc">{player.description}</p>}

          {streamLoading ? (
            <SkeletonVideoPlayer />
          ) : streamUrl ? (
            <video controls playsInline className="video-panel__player" src={streamUrl} />
          ) : (
            <p className="text-error">Video stream unavailable.</p>
          )}
        </div>
      )}

      {loading ? (
        <>
          <SkeletonMeta />
          <SkeletonCardGrid count={6} />
        </>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No videos yet"
          description="Try changing filters, or check back once your instructors upload chapter videos."
        />
      ) : (
        <>
          <ListMeta end={videos.length} label={`video${videos.length === 1 ? "" : "s"}`} />
          <div className="item-grid">
          {videos.map((video) => (
            <button
              key={video._id}
              type="button"
              onClick={() => openPlayer(video)}
              className="item-card"
              style={{ cursor: "pointer", textAlign: "left", width: "100%" }}
            >
              <div className="item-card__body">
                <span className="item-card__badge">
                  <Play size={14} /> Watch lecture
                </span>
                <h3>{video.title}</h3>
                <p className="item-card__meta">
                  <Layers size={14} />
                  {video.chapterId?.name || "Chapter"}
                </p>
                {video.bookId?.title && (
                  <p className="item-card__meta">{video.bookId.title}</p>
                )}
                {video.description && (
                  <p className="item-card__desc">
                    {video.description.length > 110
                      ? `${video.description.slice(0, 110)}…`
                      : video.description}
                  </p>
                )}
              </div>
            </button>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
