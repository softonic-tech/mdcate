
// "use client";

// import { useState, useEffect } from "react";
// import HeroSection from "@/components/book/HeroSection";
// import BookCard from "@/components/book/BookCard";
// import NotesCard from "@/components/notes/NotesCard";
// import AddNoteModal from "@/components/notes/AddNoteModal";
// import ViewNoteModal from "@/components/notes/ViewNoteModal";
// import { getBooks } from "@/api/book.api";
// import { 
//   getNotes, 
//   createNote, 
//   getNoteById,
//   deleteNote,
//   updateNote
// } from "@/api/notes.api";
// import { getSubjectsApi } from "@/api/subject.api";
// export default function BooksPage() {
//   const [search, setSearch] = useState("");
//   const [board, setBoard] = useState("");
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("books"); // toggle state
//   const [openAddModal, setOpenAddModal] = useState(false);
//   const [noteSearch, setNoteSearch] = useState("");
//   const [noteSubject, setNoteSubject] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalBooks, setTotalBooks] = useState(0);
//   const [notes, setNotes] = useState([]);
//   const [notesLoading, setNotesLoading] = useState(false);
//   const [noteType, setNoteType] = useState(""); // formula/shortcut/all
//   const [viewNote, setViewNote] = useState(null);
//   const [editNote, setEditNote] = useState(null);
//   const [notesTotal, setNotesTotal] = useState(0); // total notes
//   const [subjects, setSubjects] = useState([]);

//   const limit = 12; // items per page
// const fetchSubjects = async () => {
//   try {
//     const res = await getSubjectsApi();

//     console.log("subjects API response:", res);

//     setSubjects(res?.data?.data || res?.data || res || []);

//   } catch (err) {
//     console.error("Error fetching subjects", err);
//   }
// };
// useEffect(() => {
//   fetchSubjects();
// }, []);
//   const handleViewNote = async (note) => {
//   try {
//     const res = await getNoteById(note._id);

//     if (res?.data) {
//       setViewNote(res.data);
//     } else {
//       console.error("No note returned from API:", res);
//     }
//   } catch (err) {
//     // Axios interceptor returns { message, status } now
//     console.error("Error fetching note details:", err.message || err);
//   }
// };
//   // Fetch books from API with search, filter & pagination
// const fetchBooks = async () => {
//   try {
//     setLoading(true);

//     const res = await getBooks({ search, board, page, limit });

//     setBooks(res.data || []);                 // ✅ correct
//     setTotalBooks(res.pagination?.total || 0); // ✅ correct

//   } catch (err) {
//     console.error("Error fetching books", err);
//   } finally {
//     setLoading(false);
//   }
// };

// const fetchNotes = async () => {
//   try {
//     setNotesLoading(true);
    
//     const res = await getNotes({
//       search: noteSearch,
//       subjectId: noteSubject, // ✅ fix
//       type: noteType,
//       page,
//       limit
//     });

//       if (res.success) {
//         setNotes(res.data || []); // ✅ correct
//         setNotesTotal(res.pagination?.total || 0); 
//       }
//      else {
//       setNotes([]);
//       setNotesTotal(0);
//       console.error("API returned error:", res);
//     }

//   } catch (err) {
//     console.error("Error fetching notes:", err.message || err);
//   } finally {
//     setNotesLoading(false);
//   }
// };

// // calculate total pages for notes pagination
// const notesTotalPages = Math.ceil(notesTotal / limit);
//   // Fetch whenever search, filter or page changes
//   useEffect(() => {
//     fetchBooks();
//   }, [search, board, page]);

// useEffect(() => {
//   const timer = setTimeout(() => {
//     if (activeTab === "notes") fetchNotes();
//   }, 400);
//   return () => clearTimeout(timer);
// }, [noteSearch, noteSubject, noteType, activeTab]);

//   // Calculate total pages for pagination
//   const totalPages = Math.ceil(totalBooks / limit);

//   // Create notes

// const handleCreateNote = async (data) => {
//   try {
//     const res = await createNote(data);
//     console.log("Note created response:", res);

//     if (res.success && res.data) {
//       setNotes((prev) => [res.data, ...prev]);
//       setOpenAddModal(false);
//     } else {
//       console.error("API returned error:", res);
//       alert(res.message || "Failed to create note");
//     }

//   } catch (err) {
//     console.error("Error creating note:", err.message || err);
//     alert(err.message || "Something went wrong while creating note");
//   }
// };


// const handleDeleteNote = async (note) => {

//   const confirmDelete = confirm("Are you sure you want to delete this note?");
//   if (!confirmDelete) return;

//   try {

//     await deleteNote(note._id);

//     // UI update
//     setNotes((prev) => prev.filter((n) => n._id !== note._id));

//   } catch (err) {
//     console.error("Error deleting note", err);
//   }
// };

// const handleEditNote = (note) => {
//   setEditNote(note);
//   setOpenAddModal(true);
// };
// const handleUpdateNote = async (data) => {
//   try {

//     const res = await updateNote(editNote._id, data);

//     setNotes((prev) =>
//       prev.map((n) =>
//         n._id === editNote._id ? res.data : n
//       )
//     );

//     setEditNote(null);
//     setOpenAddModal(false);

//   } catch (err) {
//     console.error("Update error", err);
//   }
// };


//   return (
//     <div className="container">
//       <div className="toggle-tabs">
//         <button
//           onClick={() => setActiveTab("books")}
//           className={`toggle-tab ${
//             activeTab === "books" ? "toggle-tab--active" : ""
//           }`}
//         >
//           Books
//         </button>

//         <button
//           onClick={() => setActiveTab("notes")}
//           className={`toggle-tab ${
//             activeTab === "notes" ? "toggle-tab--active" : ""
//           }`}
//         >
//           Notes
//         </button>
//       </div>

//       {/* BOOKS SECTION */}
//       {activeTab === "books" && (
//         <>
//           <HeroSection />

//           {/* Filter Bar */}
//           <div className="books-filter">
//             <input
//               type="text"
//               placeholder="Search books..."
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setPage(1); // reset page when search changes
//               }}
//             />

//             <select
//               value={board}
//               onChange={(e) => {
//                 setBoard(e.target.value);
//                 setPage(1); // reset page when filter changes
//               }}
//             >
//               <option value="">All Boards</option>
//               <option value="KPK">KPK</option>
//               <option value="Punjab">Punjab</option>
//               <option value="Federal">Federal</option>
//             </select>
//           </div>

//           {/* Books Grid */}
//           <div className="book-grid">
//             {loading ? (
//               <p className="text-center col-span-full">Loading books...</p>
//             ) : books.length > 0 ? (
//               books.map((book) => <BookCard key={book._id} book={book} />)
//             ) : (
//               <p className="text-center col-span-full">No books found.</p>
//             )}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="pagination mt-6 flex justify-center gap-2">
//               {Array.from({ length: totalPages }, (_, i) => (
//                 <button
//                   key={i + 1}
//                   onClick={() => setPage(i + 1)}
//                   className={`px-3 py-1 rounded ${
//                     page === i + 1
//                       ? "bg-blue-500 text-white"
//                       : "bg-gray-200 text-gray-700"
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* NOTES SECTION */}
//      {activeTab === "notes" && (
//         <div className="notes-section mt-6">
//           <div className="notes-header">

//           <div className="notes-header-left">

//             <h2>Shortcuts & Formulae</h2>

//             <div className="notes-controls">

//               <input
//                 className="notes-search"
//                 placeholder="Search notes..."
//                 value={noteSearch}
//                 onChange={(e)=>setNoteSearch(e.target.value)}
//               />

//            <select
//               className="notes-filter"
//               value={noteSubject}
//               onChange={(e)=>{
//                 setNoteSubject(e.target.value);
//                 setPage(1);
//               }}
//             >
//               <option value="">All Subjects</option>
//               {subjects?.length > 0 ? (
//                 subjects.map(s => (
//                   <option key={s._id} value={s._id}>
//                     {s.name} {s.board && `- ${s.board}`}
//                   </option>
//                 ))
//               ) : (
//                 <option disabled>No subjects found</option>
//               )}
//             </select>

//             <select
//               className="notes-filter"
//               value={noteType}
//               onChange={(e) => setNoteType(e.target.value)}
//             >
//               <option value="">All Types</option>
//               <option value="formula">Formula</option>
//               <option value="shortcut">Shortcut</option>
//               <option value="summary">Summary</option>
//               <option value="general">General</option>
//             </select>

//             </div>

//           </div>

//           <button
//             className="add-note-btn"
//             onClick={() => {
//               setEditNote(null);   // reset edit state
//               setOpenAddModal(true);
//             }}
//           >
//             + Add Note
//           </button>

//         </div>
//           <div className="notes-grid">
           

//             {notesLoading ? (
//               <p>Loading notes...</p>
//             ) : notes.length === 0 ? (
//               <p>No notes found</p>
//             ) : (
//              notes.map((note) => {
//               const subject = subjects.find(
//                 s => s._id === (note.subjectId?._id || note.subjectId)
//             );

//             return (
//               <NotesCard
//                 key={note._id}
//                 note={note}
//                 subjectName={subject?.name}
//                 subjectBoard={subject?.board}
//                 onView={handleViewNote}
//                 onEdit={handleEditNote}
//                 onDelete={handleDeleteNote}
//               />
//             );
//           })
//             )}
//           </div>
//         </div>
//       )}

//      <AddNoteModal
//         open={openAddModal}
//         onClose={() => {
//           setOpenAddModal(false);
//           setEditNote(null);
//         }}
//         onSubmit={editNote ? handleUpdateNote : handleCreateNote}
//         note={editNote}
//         subjects={subjects}
//       />
//       <ViewNoteModal
//         note={viewNote}
//         onClose={() => setViewNote(null)}
//       />
//       {notesTotalPages > 1 && (
//         <div className="pagination flex justify-center gap-2 mt-4">
//           {Array.from({ length: notesTotalPages }, (_, i) => (
//             <button
//               key={i + 1}
//               onClick={() => setPage(i + 1)}
//               className={`px-3 py-1 rounded ${
//                 page === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
//               }`}
//             >
//               {i + 1}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/book/HeroSection";
import BookCard from "@/components/book/BookCard";
import { getBooks } from "@/api/book.api";

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [board, setBoard] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  const limit = 12;

  // ================= FETCH BOOKS =================
  const fetchBooks = async () => {
    try {
      setLoading(true);

      const res = await getBooks({
        search,
        board,
        page,
        limit,
      });

      setBooks(res.data || []);
      setTotalBooks(res.pagination?.total || 0);

    } catch (err) {
      console.error("Error fetching books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, board, page]);

  const totalPages = Math.ceil(totalBooks / limit);

  return (
    <div className="container">

      {/* HERO */}
      <HeroSection />

      {/* FILTER BAR (UNCHANGED) */}
      <div className="books-filter">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={board}
          onChange={(e) => {
            setBoard(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Boards</option>
          <option value="KPK">KPK</option>
          <option value="Punjab">Punjab</option>
          <option value="Federal">Federal</option>
        </select>
      </div>

      {/* BOOK GRID (UNCHANGED) */}
      <div className="book-grid">
        {loading ? (
          <p className="text-center col-span-full">Loading books...</p>
        ) : books.length > 0 ? (
          books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))
        ) : (
          <p className="text-center col-span-full">
            No books found.
          </p>
        )}
      </div>

      {/* PAGINATION (UNCHANGED) */}
      {totalPages > 1 && (
        <div className="pagination mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}