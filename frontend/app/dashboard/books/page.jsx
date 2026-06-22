"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import { getBooks } from "@/api/book.api";
import BookCard from "@/components/book/BookCard";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonCardGrid, SkeletonMeta } from "@/components/dashboard/Skeleton";
import {
  FilterPanel,
  FilterField,
  FilterRow,
  ListMeta,
  PaginationBar,
} from "@/components/dashboard/StudyPageUI";
import { usePageSearch } from "@/hooks/usePageSearch";

const BOARDS = ["KPK", "Punjab", "Federal"];

export default function BooksPage() {
  const { query, clearQuery } = usePageSearch("Search books…");
  const [board, setBoard] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const prevQueryRef = useRef(query);

  const limit = 12;

  useEffect(() => {
    if (prevQueryRef.current !== query) {
      prevQueryRef.current = query;
      setPage(1);
      return;
    }

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await getBooks({ search: query, board, page, limit });
        setBooks(res.data || []);
        setTotalBooks(res.pagination?.total || 0);
      } catch (err) {
        console.error("Error fetching books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [query, board, page]);

  const totalPages = Math.ceil(totalBooks / limit);
  const pageStart = totalBooks ? (page - 1) * limit + 1 : 0;
  const pageEnd = Math.min(page * limit, totalBooks);
  const hasActiveFilters = Boolean(query.trim() || board);

  const clearFilters = () => {
    clearQuery();
    setBoard("");
    setPage(1);
  };

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: BookOpen, label: "Library" }}
        title="Books & Notes"
        description="Browse textbooks and study materials for your board."
      />

      <FilterPanel hasActiveFilters={hasActiveFilters} onClear={clearFilters} ariaLabel="Filter books">
        <FilterRow>
          <FilterField label="Board" icon={GraduationCap}>
            <select
              value={board}
              onChange={(e) => {
                setBoard(e.target.value);
                setPage(1);
              }}
              aria-label="Board"
            >
              <option value="">All boards</option>
              {BOARDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </FilterField>
        </FilterRow>
      </FilterPanel>

      {loading ? <SkeletonMeta /> : books.length > 0 ? (
        <ListMeta start={pageStart} end={pageEnd} total={totalBooks} label="books" />
      ) : null}

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : (
      <div className="item-grid">
        {books.length > 0 ? (
          books.map((book) => <BookCard key={book._id} book={book} />)
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No books found"
            description="Try a different search or board filter."
            className="span-full"
            action={
              hasActiveFilters ? (
                <button type="button" className="btn-primary" onClick={clearFilters}>
                  Clear filters
                </button>
              ) : null
            }
          />
        )}
      </div>
      )}

      <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
