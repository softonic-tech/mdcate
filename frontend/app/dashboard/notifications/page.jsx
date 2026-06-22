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
import { Bell, Filter, Tag } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { SkeletonListRows } from "@/components/dashboard/Skeleton";
import { dispatchUnreadCount } from "@/utils/notificationEvents";
import {
  FilterPanel,
  FilterRow,
  FilterField,
  ListMeta,
} from "@/components/dashboard/StudyPageUI";
import { usePageSearch } from "@/hooks/usePageSearch";

function getUserId(user) {
  const id = user?.id || user?._id;
  return id ? String(id) : "";
}

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export default function UserNotifications() {
  const { user } = useAuth();
  const { query, clearQuery } = usePageSearch("Search notifications…");

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const userId = getUserId(user);

  const isRead = (n) => {
    if (n.isExam) return false;
    if (!userId) return false;
    return n.readBy?.some((id) => String(id) === userId);
  };

  const load = async () => {
    setLoading(true);
    try {
      const notifRes = await getNotifications();
      const normalNotifications = extractList(notifRes);

      let examNotifications = [];
      try {
        const examRes = await getExams();
        examNotifications = extractList(examRes).map((exam) => ({
          _id: `exam_${exam._id}`,
          title: exam.title,
          message:
            exam.daysRemaining > 0
              ? `${exam.daysRemaining} day${exam.daysRemaining === 1 ? "" : "s"} left until exam`
              : exam.daysRemaining === 0
              ? "Exam day is today"
              : "Exam date has passed",
          type: "exam",
          createdAt: exam.createdAt || exam.examDate,
          isExam: true,
        }));
      } catch {
        /* exam countdown is optional — don't block notifications */
      }

      const merged = [...normalNotifications, ...examNotifications];
      merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifs(merged);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to load notifications");
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) load();
    else setLoading(false);
  }, [userId]);

  const markRead = async (id) => {
    if (id.startsWith("exam_")) return;
    const res = await markNotificationAsRead(id);
    if (res?.unreadCount != null) dispatchUnreadCount(res.unreadCount);
    load();
  };

  const markUnread = async (id) => {
    if (id.startsWith("exam_")) return;
    const res = await markNotificationAsUnread(id);
    if (res?.unreadCount != null) dispatchUnreadCount(res.unreadCount);
    load();
  };

  const markAll = async () => {
    const res = await markAllAsRead();
    if (res?.unreadCount != null) dispatchUnreadCount(res.unreadCount);
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
        n.title?.toLowerCase().includes(query.toLowerCase()) ||
        n.message?.toLowerCase().includes(query.toLowerCase())
    );

  const hasActiveFilters =
    query.trim() !== "" || status !== "all" || type !== "all";

  const clearFilters = () => {
    clearQuery();
    setStatus("all");
    setType("all");
  };

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Bell, label: "Alerts" }}
        title="Notifications"
        description="Stay updated on exams, reminders, and achievements."
        actions={
          <button type="button" className="btn-primary" onClick={markAll}>
            Mark All Read
          </button>
        }
      />

      <FilterPanel
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        ariaLabel="Filter notifications"
      >
        <FilterRow>
          <FilterField label="Status" icon={Filter}>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>
          </FilterField>
          <FilterField label="Type" icon={Tag}>
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Type">
              <option value="all">All types</option>
              <option value="system">System</option>
              <option value="reminder">Reminder</option>
              <option value="exam">Exam</option>
              <option value="achievement">Achievement</option>
              <option value="challenge">Challenge</option>
            </select>
          </FilterField>
        </FilterRow>
      </FilterPanel>

      {loading ? (
        <SkeletonListRows count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are all caught up."
        />
      ) : (
        <>
          <ListMeta end={filtered.length} label="notifications" />
          <div>
          {filtered.map((n) => (
            <div key={n._id} className="note-card note-card--row">
              <div>
                <h3 className="note-card__title">{n.title}</h3>
                <p className="item-card__desc">{n.message}</p>
                <div className="note-card__meta-row">
                  <span className="type-badge">{n.type}</span>
                  <span className="text-muted text-muted--sm">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                  {!isRead(n) && <span className="badge badge--dark">New</span>}
                </div>
              </div>
              {!n.isExam && (
                <div className="note-card__actions">
                  {!isRead(n) ? (
                    <button type="button" className="note-card__btn" onClick={() => markRead(n._id)}>
                      Read
                    </button>
                  ) : (
                    <button type="button" className="note-card__btn" onClick={() => markUnread(n._id)}>
                      Unread
                    </button>
                  )}
                  <button type="button" className="btn-danger btn-ghost" onClick={() => del(n._id)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}