"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { getStudyPlan, saveStudyPlan, deleteStudyPlan, updateStudyPlan } from "@/api/studyPlan.api";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { ListMeta } from "@/components/dashboard/StudyPageUI";
import Modal from "@/components/dashboard/Modal";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";

function getDaysLeft(date) {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getPlanStatus(plan) {
  if (plan.status === "completed") return "completed";
  if (new Date(plan.deadline) < new Date()) return "expired";
  return "pending";
}

function getDeadlineInfo(deadline, status) {
  if (status === "completed") {
    return { text: "Marked complete", tone: "success" };
  }

  const days = getDaysLeft(deadline);
  if (days < 0) {
    const n = Math.abs(days);
    return { text: `${n} day${n === 1 ? "" : "s"} overdue`, tone: "danger" };
  }
  if (days === 0) return { text: "Due today", tone: "urgent" };
  if (days === 1) return { text: "Due tomorrow", tone: "warning" };
  if (days <= 7) return { text: `${days} days left`, tone: "warning" };
  return { text: `${days} days left`, tone: "neutral" };
}

const STATUS_LABELS = {
  completed: "Completed",
  expired: "Overdue",
  pending: "In progress",
};

const STATUS_BADGE = {
  completed: "badge--success",
  expired: "badge--danger",
  pending: "badge--warning",
};

export default function StudyPlanPage() {
  const [plans, setPlans] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", deadline: "" });
  const remindedRef = useRef(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const aDone = a.status === "completed";
      const bDone = b.status === "completed";
      if (aDone !== bDone) return aDone ? 1 : -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }, [plans]);

  const checkReminders = (list) => {
    const now = new Date();
    list.forEach((plan) => {
      if (!plan.deadline) return;
      const diff = new Date(plan.deadline) - now;
      const daysLeft = diff / (1000 * 60 * 60 * 24);
      const key = plan._id;
      if (remindedRef.current.has(key)) return;
      if (daysLeft <= 7 && daysLeft > 6) {
        toast("7 days left: " + plan.title);
        remindedRef.current.add(key);
      }
      if (daysLeft <= 1 && daysLeft > 0) {
        toast.error("1 day left: " + plan.title);
        remindedRef.current.add(key);
      }
      if (daysLeft <= 0) {
        toast.error("Deadline passed: " + plan.title);
        remindedRef.current.add(key);
      }
    });
  };

  const load = async () => {
    try {
      const res = await getStudyPlan();
      const data = res?.data?.data ?? res?.data ?? [];
      const list = Array.isArray(data) ? data : [];
      setPlans(list);
      checkReminders(list);
    } catch {
      setPlans([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (plans.length) checkReminders(plans);
    }, 60000);
    return () => clearInterval(interval);
  }, [plans]);

  const openCreate = () => {
    setForm({ title: "", deadline: "" });
    setEditId(null);
    setOpen(true);
  };

  const openEdit = (plan) => {
    setForm({ title: plan.title, deadline: plan.deadline?.split("T")[0] });
    setEditId(plan._id);
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editId) {
        await updateStudyPlan(editId, form);
        toast.success("Updated");
      } else {
        await saveStudyPlan(form);
        toast.success("Created");
      }
      setOpen(false);
      setEditId(null);
      setForm({ title: "", deadline: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const removePlan = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteStudyPlan(deleteTarget);
      toast.success("Deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const toggleComplete = async (p) => {
    try {
      const newStatus = p.status === "completed" ? "pending" : "completed";
      await updateStudyPlan(p._id, { status: newStatus });
      toast.success(newStatus === "completed" ? "Marked complete" : "Marked in progress");
      load();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: CalendarCheck, label: "Planning" }}
        title="Study Planner"
        description="Organize tasks and track deadlines for your MDCAT prep."
        actions={
          <button type="button" className="btn-primary" onClick={openCreate}>
            Add Plan
          </button>
        }
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No study plans yet"
          description="Create your first plan to stay on track."
          action={
            <button type="button" className="btn-primary mt-md" onClick={openCreate}>
              Create Plan
            </button>
          }
        />
      ) : (
        <>
          <ListMeta end={plans.length} label="plans" />
          <div className="plan-list">
            {sortedPlans.map((p) => {
              const status = getPlanStatus(p);
              const deadline = getDeadlineInfo(p.deadline, status);
              const isCompleted = status === "completed";

              return (
                <article key={p._id} className={`plan-card plan-card--${status}`}>
                  <div className="plan-card__body">
                    <div className="plan-card__head">
                      <button
                        type="button"
                        className="plan-card__check"
                        onClick={() => toggleComplete(p)}
                        aria-label={isCompleted ? "Mark as in progress" : "Mark as complete"}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={20} strokeWidth={2} />
                        ) : (
                          <Circle size={20} strokeWidth={1.8} />
                        )}
                      </button>

                      <div className="plan-card__content">
                        <h3 className={`plan-card__title${isCompleted ? " plan-card__title--done" : ""}`}>
                          {p.title}
                        </h3>
                        <p className="plan-card__date">
                          <Calendar size={14} aria-hidden="true" />
                          Due {new Date(p.deadline).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <span className={`badge plan-card__badge ${STATUS_BADGE[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                    </div>

                    <div className="plan-card__footer">
                      <p className={`plan-card__countdown plan-card__countdown--${deadline.tone}`}>
                        <Clock size={14} aria-hidden="true" />
                        {deadline.text}
                      </p>

                      <div className="plan-card__actions">
                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger btn-ghost"
                          onClick={() => setDeleteTarget(p._id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Update Plan" : "Create Plan"}
        subtitle="Give your plan a clear title and a realistic deadline."
        as="form"
        onSubmit={handleSubmit}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="plan-title">Title</label>
          <input
            id="plan-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Finish Biology chapter 5"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="plan-deadline">Deadline</label>
          <input
            id="plan-deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            required
          />
          <p className="form-hint">Pick the date you want to complete this by.</p>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={removePlan}
        title="Delete study plan?"
        message="This plan will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep plan"
        loading={deleting}
      />
    </div>
  );
}
