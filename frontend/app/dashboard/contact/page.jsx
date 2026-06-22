"use client";

import { useState, useEffect } from "react";
import { createContactMessage, getContactMessages } from "@/api/contact.api";
import { CONTACT_INFO, CONTACT_SUBJECTS } from "@/constants/contact";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { HelpCircle, Mail, Phone, Headphones } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import SectionTitle from "@/components/dashboard/SectionTitle";
import Modal from "@/components/dashboard/Modal";
import { CustomSelect } from "@/components/dashboard/CustomSelect";

const METHOD_ICONS = {
  email: Mail,
  whatsapp: Phone,
  "live-chat": Headphones,
};

function ContactMethod({ method }) {
  const Icon = METHOD_ICONS[method.id] || Mail;

  return (
    <div className="profile-tile contact-method">
      <span className="profile-tile__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="profile-tile__content">
        <span className="profile-tile__label">{method.label}</span>
        {method.href ? (
          <a className="profile-tile__value contact-method__link" href={method.href}>
            {method.value}
          </a>
        ) : (
          <span className="profile-tile__value">{method.value}</span>
        )}
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    email: "",
    subject: CONTACT_SUBJECTS[0],
    message: "",
  });

  const load = () => {
    getContactMessages()
      .then((r) => setMsgs(r?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.email || !form.subject || !form.message) {
      return toast.error("Fill all fields");
    }
    try {
      setSending(true);
      await createContactMessage(form);
      toast.success("Message sent");
      setForm((prev) => ({
        ...prev,
        subject: CONTACT_SUBJECTS[0],
        message: "",
      }));
      setOpen(false);
      load();
    } catch {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: HelpCircle, label: "Support" }}
        title="Support Center"
        description={CONTACT_INFO.description}
        actions={
          <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
            Contact Support
          </button>
        }
      />

      <section className="content-card content-card--spaced contact-support">
        <span className="page-head__eyebrow">{CONTACT_INFO.eyebrow}</span>
        <h2 className="contact-support__title">{CONTACT_INFO.title}</h2>
        <div className="profile-tiles contact-support__methods">
          {CONTACT_INFO.methods.map((method) => (
            <ContactMethod key={method.id} method={method} />
          ))}
        </div>
      </section>

      <SectionTitle title="Your Messages" />

      {msgs.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No messages yet"
          description="Send us a message if you need assistance."
        />
      ) : (
        <div className="data-list">
          {msgs.map((m) => (
            <div key={m._id} className="panel">
              <div className="item-card__head-row">
                <h3 className="panel__title">{m.subject}</h3>
                <span className={`badge ${m.status === "resolved" ? "badge--success" : "badge--warning"}`}>
                  {m.status}
                </span>
              </div>
              <p className="item-card__desc">{m.message}</p>
              {m.response && (
                <div className="mcq-feedback mcq-feedback--correct mt-sm">
                  <strong>Reply</strong>
                  <p>{m.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Send Message"
        subtitle={CONTACT_INFO.responseTime}
        as="form"
        onSubmit={handleSend}
        footer={
          <>
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contact-subject">Subject</label>
          <CustomSelect
            id="contact-subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          >
            {CONTACT_SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </CustomSelect>
        </div>
        <div className="form-group">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we help you?"
            required
          />
        </div>
      </Modal>
    </div>
  );
}
