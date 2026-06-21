// "use client";

// import { useState, useEffect } from "react";
// import {
//   getNotifications,
//   markNotificationAsRead,
//   markNotificationAsUnread,
//   markAllAsRead,
//   deleteNotification,
// } from "@/api/notification.api";

// import { useAuth } from "@/context/AuthContext";
// import toast from "react-hot-toast";

// export default function UserNotifications() {
//   const { user } = useAuth();

//   const [notifs, setNotifs] = useState([]);
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("all");
//   const [type, setType] = useState("all");

//   // ✅ check read status per user
//   const isRead = (n) => {
//   if (!user?._id) return false;
//   return n.readBy?.some(id => id === user._id);
// };

// const load = async () => {
//   try {
//     const res = await getNotifications();
//     console.log("API DATA:", res);
//     setNotifs(res?.data || []);
//   } catch (err) {
//     console.log(err);
//   }
// };
//   useEffect(() => {
//   if (user?._id) {
//     load();
//   }
// }, [user]);

//   const markRead = async (id) => {
//     await markNotificationAsRead(id);
//     load();
//   };

//   const markUnread = async (id) => {
//     await markNotificationAsUnread(id);
//     load();
//   };

//   const markAll = async () => {
//     await markAllAsRead();
//     toast.success("All marked as read");
//     load();
//   };

//   const del = async (id) => {
//     await deleteNotification(id);
//     toast.success("Deleted");
//     load();
//   };

//   // ✅ FIXED FILTER
//   const filtered = notifs
//     .filter((n) =>
//       status === "all"
//         ? true
//         : status === "read"
//         ? isRead(n)
//         : !isRead(n)
//     )
//     .filter((n) =>
//       type === "all" ? true : n.type?.toLowerCase() === type
//     )
//     .filter(
//       (n) =>
//         n.title?.toLowerCase().includes(search.toLowerCase()) ||
//         n.message?.toLowerCase().includes(search.toLowerCase())
//     );

//   return (
//     <div className="notes-section">
      
//       {/* HEADER */}
//       <div className="notes-header">
//         <div className="notes-header-left">
//           <h2>Notifications</h2>

//           <div className="notes-controls">
//             <input
//               type="text"
//               placeholder="Search notifications..."
//               className="notes-search"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />

//             <select
//               className="notes-filter"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//             >
//               <option value="all">All</option>
//               <option value="read">Read</option>
//               <option value="unread">Unread</option>
//             </select>

//             <select
//               className="notes-filter"
//               value={type}
//               onChange={(e) => setType(e.target.value)}
//             >
//               <option value="all">All Types</option>
//               <option value="system">System</option>
//               <option value="reminder">Reminder</option>
//               <option value="exam">Exam</option>
//               <option value="achievement">Achievement</option>
//               <option value="challenge">Challenge</option>
//             </select>
//           </div>
//         </div>

//         {/* RIGHT BUTTON */}
//         <button className="add-note-btn" onClick={markAll}>
//           Mark All Read
//         </button>
//       </div>

//       {/* LIST */}
//       <div className="space-y-3">
//         {filtered.length === 0 && (
//           <p className="text-gray-400">No notifications</p>
//         )}

//         {filtered.map((n) => (
//           <div
//             key={n._id}
//             className="note-card flex justify-between items-start group"
//           >
//             <div>
//               <h3 className="note-card__title">
//                 {n.title}
//               </h3>

//               <p className="text-sm text-gray-400 mb-2">
//                 {n.message}
//               </p>

//               <div className="flex gap-3 text-xs text-gray-500">
//                 <span className="type-badge">
//                   {n.type || "system"}
//                 </span>

//                 <span>
//                   {new Date(n.createdAt).toLocaleString()}
//                 </span>

//                 {/* ✅ FIXED */}
//                 {!isRead(n) && (
//                   <span className="text-teal-400 font-semibold">
//                     NEW
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* actions */}
//             <div className="flex gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200">
//               {/* ✅ FIXED */}
//               {!isRead(n) ? (
//                 <button
//                   className="note-card__btn"
//                   onClick={() => markRead(n._id)}
//                 >
//                   Read
//                 </button>
//               ) : (
//                 <button
//                   className="note-card__btn"
//                   onClick={() => markUnread(n._id)}
//                 >
//                   Unread
//                 </button>
//               )}

//               <button
//                 className="profile__btn profile__btn--danger"
//                 onClick={() => del(n._id)}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllAsRead,
  deleteNotification,
} from "@/api/notification.api";

import { getExams } from "@/api/examCountdown.api"; // ✅ ADD THIS

import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function UserNotifications() {
  const { user } = useAuth();

  const [notifs, setNotifs] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const isRead = (n) => {
    if (n.isExam) return false; // exam countdown always unread
    if (!user?._id) return false;
    return n.readBy?.some((id) => id === user._id);
  };

  const load = async () => {
    try {
      const [notifRes, examRes] = await Promise.all([
        getNotifications(),
        getExams(),
      ]);

      const normalNotifications = notifRes?.data || [];

      const examNotifications =
        (examRes?.data || []).map((exam) => ({
          _id: "exam_" + exam._id,
          title: exam.title,
          message:
            exam.daysRemaining > 0
              ? `${exam.daysRemaining} day left in exam`
              : "Exam day reached",
          type: "exam",
          createdAt: exam.createdAt,
          isExam: true,
        })) || [];

      const merged = [...normalNotifications, ...examNotifications];

      merged.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifs(merged);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?._id) load();
  }, [user]);

  const markRead = async (id) => {
    if (id.startsWith("exam_")) return;
    await markNotificationAsRead(id);
    load();
  };

  const markUnread = async (id) => {
    if (id.startsWith("exam_")) return;
    await markNotificationAsUnread(id);
    load();
  };

  const markAll = async () => {
    await markAllAsRead();
    toast.success("All marked as read");
    load();
  };

  const del = async (id) => {
    if (id.startsWith("exam_")) return;
    await deleteNotification(id);
    toast.success("Deleted");
    load();
  };

  const filtered = notifs
    .filter((n) =>
      status === "all"
        ? true
        : status === "read"
        ? isRead(n)
        : !isRead(n)
    )
    .filter((n) =>
      type === "all" ? true : n.type?.toLowerCase() === type
    )
    .filter(
      (n) =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.message?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="notes-section">
      <div className="notes-header">
        <div className="notes-header-left">
          <h2>Notifications</h2>

          <div className="notes-controls">
            <input
              type="text"
              placeholder="Search notifications..."
              className="notes-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="notes-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>

            <select
              className="notes-filter"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="reminder">Reminder</option>
              <option value="exam">Exam</option>
              <option value="achievement">Achievement</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>
        </div>

        <button className="add-note-btn" onClick={markAll}>
          Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-gray-400">No notifications</p>
        )}

        {filtered.map((n) => (
          <div
            key={n._id}
            className="note-card flex justify-between items-start group"
          >
            <div>
              <h3 className="note-card__title">{n.title}</h3>

              <p className="text-sm text-gray-400 mb-2">
                {n.message}
              </p>

              <div className="flex gap-3 text-xs text-gray-500">
                <span className="type-badge">
                  {n.type}
                </span>

                <span>
                  {new Date(n.createdAt).toLocaleString()}
                </span>

                {!isRead(n) && (
                  <span className="text-teal-400 font-semibold">
                    NEW
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              {!n.isExam && (
                <>
                  {!isRead(n) ? (
                    <button
                      className="note-card__btn"
                      onClick={() => markRead(n._id)}
                    >
                      Read
                    </button>
                  ) : (
                    <button
                      className="note-card__btn"
                      onClick={() => markUnread(n._id)}
                    >
                      Unread
                    </button>
                  )}

                  <button
                    className="profile__btn profile__btn--danger"
                    onClick={() => del(n._id)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}