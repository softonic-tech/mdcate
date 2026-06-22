// "use client";

// import { useState } from "react";
// import { MoreVertical, Pencil, Trash2 } from "lucide-react";

// export default function NotesCard({ 
//   note, 
//   onView, 
//   onEdit, 
//   onDelete,
//   subjectName,
//   subjectBoard
// }) {

//   const [openMenu, setOpenMenu] = useState(false);

//   return (
//     <div className="note-card">

//       <div className="note-card__menu">
//         <button
//           className="menu-btn"
//           onClick={() => setOpenMenu(!openMenu)}
//         >
//           <MoreVertical size={18}/>
//         </button>

//         {openMenu && (
//           <div className="menu-dropdown">
//             <button
//               className="menu-item"
//               onClick={() => onEdit(note)}
//             >
//               <Pencil size={16}/>
//               Edit
//             </button>

//             <button
//               className="menu-item danger"
//               onClick={() => onDelete(note)}
//             >
//               <Trash2 size={16}/>
//               Delete
//             </button>
//           </div>
//         )}
//       </div>

//       <h4 className="note-card__title">{note.title}</h4>

//       <p className="note-card__subject">
//         Subject:
//         <span>
//           {subjectName} {subjectBoard && `(${subjectBoard})`}
//         </span>
//       </p>

//       <div className="note-card__footer">
//         <span className={`type-badge ${note.type}`}>
//           {note.type.toUpperCase()}
//         </span>

//         <button
//           className="note-card__btn"
//           onClick={() => onView(note)}
//         >
//           View
//         </button>
//       </div>

//     </div>
//   );
// }

"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function NotesCard({
  note,
  onView,
  onEdit,
  onDelete,
  subjectName,
  subjectBoard,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  // ✅ CLOSE ON OUTSIDE CLICK (REAL APP BEHAVIOR)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="note-card relative">

      {/* ================= MENU ================= */}
      <div className="note-card__menu" ref={menuRef}>
        <button
          className="menu-btn"
          onClick={() => setOpenMenu((prev) => !prev)}
          aria-label="Note options"
        >
          <MoreVertical size={18} />
        </button>

        {openMenu && (
          <div className="menu-dropdown">
            
            <button
              className="menu-item"
              onClick={() => {
                onView(note);
                setOpenMenu(false);
              }}
            >
              <Eye size={16} />
              View
            </button>

            <button
              className="menu-item"
              onClick={() => {
                onEdit(note);
                setOpenMenu(false);
              }}
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              className="menu-item danger"
              onClick={() => {
                onDelete(note);
                setOpenMenu(false);
              }}
            >
              <Trash2 size={16} />
              Delete
            </button>

          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      <h4 className="note-card__title">{note.title}</h4>

      <p className="note-card__subject">
        Subject:
        <span>
          {subjectName} {subjectBoard && `(${subjectBoard})`}
        </span>
      </p>

      <div className="note-card__footer">
        <span className={`type-badge ${note.type}`}>
          {note.type.toUpperCase()}
        </span>

        <button className="note-card__btn" onClick={() => onView(note)}>
          View
        </button>
      </div>

    </div>
  );
}