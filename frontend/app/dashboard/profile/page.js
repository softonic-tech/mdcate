"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Trash2,
  Edit3,
  Save,
  X,
  User,
  Mail,
  BookOpen,
  GraduationCap,
  FileText,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import {
  uploadProfilePicApi,
  updateProfilePicApi,
  deleteProfilePicApi,
  getBioApi,
  updateBioApi,
  deleteBioApi,
  getAcademicApi,
  updateAcademicApi,
} from "@/api/user.api";

// ── Reusable edit section wrapper ──
function ProfileSection({ title, icon: Icon, children }) {
  return (
    <div className="profile__section">
      <div className="profile__section-header">
        <Icon size={20} strokeWidth={1.8} />
        <h3>{title}</h3>
      </div>
      <div className="profile__section-body">{children}</div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfilePicture } = useProfile();

  // ── Avatar state ──
  const fileInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // ── Bio state ──
  const [bio, setBio] = useState("");
  const [bioEditing, setBioEditing] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioFetched, setBioFetched] = useState(false);

  // ── Academic state ──
  const [academic, setAcademic] = useState({
    institution: "",
    board: "",
    year: "",
    targetExam: "",
  });
  const [acadEditing, setAcadEditing] = useState(false);
  const [acadLoading, setAcadLoading] = useState(false);
  const [acadFetched, setAcadFetched] = useState(false);

  // ── Fetch bio on mount ──
  useEffect(() => {
    if (bioFetched) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getBioApi();
        if (!cancelled) setBio(res?.data?.bio || res?.bio || "");
      } catch { /* no bio yet */ }
      finally { if (!cancelled) setBioFetched(true); }
    })();
    return () => { cancelled = true; };
  }, [bioFetched]);

  // ── Fetch academic on mount ──
  useEffect(() => {
    if (acadFetched) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getAcademicApi();
        const data = res?.data || res || {};
        if (!cancelled) {
          setAcademic({
            institution: data.institution || "",
            board: data.board || "",
            year: data.year || "",
            targetExam: data.targetExam || "",
          });
        }
      } catch { /* no academic info yet */ }
      finally { if (!cancelled) setAcadFetched(true); }
    })();
    return () => { cancelled = true; };
  }, [acadFetched]);

  // ── Avatar handlers ──
  const handleAvatarUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Image must be under 5MB.");
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    setAvatarLoading(true);
    try {
      const apiFn = profile?.profilePicture ? updateProfilePicApi : uploadProfilePicApi;
      const res = await apiFn(formData);
      const url = res?.data?.profilePicture || res?.profilePicture || "";
      updateProfilePicture(url);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err?.message || "Failed to upload picture.");
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [profile?.profilePicture, updateProfilePicture]);

  const handleAvatarDelete = useCallback(async () => {
    if (!profile?.profilePicture) return;
    setAvatarLoading(true);
    try {
      await deleteProfilePicApi();
      updateProfilePicture(null);
      toast.success("Profile picture removed.");
    } catch (err) {
      toast.error(err?.message || "Failed to delete picture.");
    } finally {
      setAvatarLoading(false);
    }
  }, [profile?.profilePicture, updateProfilePicture]);

  // ── Bio handlers ──
  const handleBioSave = useCallback(async () => {
    setBioLoading(true);
    try {
      await updateBioApi(bio);
      setBioEditing(false);
      toast.success("Bio updated!");
    } catch (err) {
      toast.error(err?.message || "Failed to update bio.");
    } finally {
      setBioLoading(false);
    }
  }, [bio]);

  const handleBioDelete = useCallback(async () => {
    setBioLoading(true);
    try {
      await deleteBioApi();
      setBio("");
      setBioEditing(false);
      toast.success("Bio removed.");
    } catch (err) {
      toast.error(err?.message || "Failed to delete bio.");
    } finally {
      setBioLoading(false);
    }
  }, []);

  // ── Academic handlers ──
  const handleAcadSave = useCallback(async () => {
    setAcadLoading(true);
    try {
      await updateAcademicApi(academic);
      setAcadEditing(false);
      toast.success("Academic info updated!");
    } catch (err) {
      toast.error(err?.message || "Failed to update academic info.");
    } finally {
      setAcadLoading(false);
    }
  }, [academic]);

  const handleAcadChange = useCallback((field, value) => {
    setAcademic((prev) => ({ ...prev, [field]: value }));
  }, []);

  const displayName = profile?.username || user?.username || "Student";
  const email = profile?.email || user?.email || "";

  return (
    <div className="profile">
      <h2 className="profile__title">My Profile</h2>

      {/* ── Avatar Card ── */}
      <div className="profile__avatar-card">
        <div className="profile__avatar-wrapper">
          {avatarLoading ? (
            <div className="profile__avatar profile__avatar--loading">
              <Loader2 size={28} className="spin" />
            </div>
          ) : profile?.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={displayName}
              className="profile__avatar"
            />
          ) : (
            <div className="profile__avatar profile__avatar--placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <button
            className="profile__avatar-edit"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change avatar"
            disabled={avatarLoading}
          >
            <Camera size={14} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarUpload}
          />
        </div>

        <div className="profile__avatar-info">
          <h3>{displayName}</h3>
          <p className="profile__avatar-email">
            <Mail size={14} />
            {email}
          </p>
          {profile?.profilePicture && (
            <button
              className="profile__avatar-remove"
              onClick={handleAvatarDelete}
              disabled={avatarLoading}
            >
              <Trash2 size={14} />
              Remove Photo
            </button>
          )}
        </div>
      </div>

      {/* ── Bio Section ── */}
      <ProfileSection title="Bio" icon={FileText}>
        {bioEditing ? (
          <div className="profile__edit-area">
            <textarea
              className="profile__textarea"
              placeholder="Tell us about yourself…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <div className="profile__edit-actions">
              <button
                className="profile__btn profile__btn--primary"
                onClick={handleBioSave}
                disabled={bioLoading}
              >
                {bioLoading ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                Save
              </button>
              <button
                className="profile__btn profile__btn--ghost"
                onClick={() => setBioEditing(false)}
                disabled={bioLoading}
              >
                <X size={14} /> Cancel
              </button>
              {bio && (
                <button
                  className="profile__btn profile__btn--danger"
                  onClick={handleBioDelete}
                  disabled={bioLoading}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="profile__view-area">
            <p className={bio ? "" : "profile__empty"}>
              {bio || "No bio added yet. Tell us about yourself!"}
            </p>
            <button className="profile__btn profile__btn--ghost" onClick={() => setBioEditing(true)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>
        )}
      </ProfileSection>

      {/* ── Academic Info ── */}
      <ProfileSection title="Academic Info" icon={GraduationCap}>
        {acadEditing ? (
          <div className="profile__edit-area">
            <div className="profile__form-grid">
              <div className="profile__field">
                <label>Institution</label>
                <input
                  type="text"
                  placeholder="e.g. Cadet College Razmak"
                  value={academic.institution}
                  onChange={(e) => handleAcadChange("institution", e.target.value)}
                />
              </div>
              <div className="profile__field">
                <label>Board</label>
                <select
                  value={academic.board}
                  onChange={(e) => handleAcadChange("board", e.target.value)}
                >
                  <option value="">Select Board</option>
                  <option value="KPK">KPK</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Federal">Federal</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="AJK">AJK</option>
                </select>
              </div>
              <div className="profile__field">
                <label>Year / Class</label>
                <input
                  type="text"
                  placeholder="e.g. 2nd Year / 12th"
                  value={academic.year}
                  onChange={(e) => handleAcadChange("year", e.target.value)}
                />
              </div>
              <div className="profile__field">
                <label>Target Exam</label>
                <select
                  value={academic.targetExam}
                  onChange={(e) => handleAcadChange("targetExam", e.target.value)}
                >
                  <option value="">Select Exam</option>
                  <option value="MDCAT">MDCAT</option>
                  <option value="ECAT">ECAT</option>
                  <option value="NTS">NTS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="profile__edit-actions">
              <button
                className="profile__btn profile__btn--primary"
                onClick={handleAcadSave}
                disabled={acadLoading}
              >
                {acadLoading ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                Save
              </button>
              <button
                className="profile__btn profile__btn--ghost"
                onClick={() => setAcadEditing(false)}
                disabled={acadLoading}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="profile__view-area">
            {academic.institution || academic.board || academic.year || academic.targetExam ? (
              <div className="profile__info-grid">
                {academic.institution && (
                  <div className="profile__info-item">
                    <span className="profile__info-label">Institution</span>
                    <span className="profile__info-value">{academic.institution}</span>
                  </div>
                )}
                {academic.board && (
                  <div className="profile__info-item">
                    <span className="profile__info-label">Board</span>
                    <span className="profile__info-value">{academic.board}</span>
                  </div>
                )}
                {academic.year && (
                  <div className="profile__info-item">
                    <span className="profile__info-label">Year / Class</span>
                    <span className="profile__info-value">{academic.year}</span>
                  </div>
                )}
                {academic.targetExam && (
                  <div className="profile__info-item">
                    <span className="profile__info-label">Target Exam</span>
                    <span className="profile__info-value">{academic.targetExam}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="profile__empty">No academic info added yet.</p>
            )}
            <button className="profile__btn profile__btn--ghost" onClick={() => setAcadEditing(true)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>
        )}
      </ProfileSection>

      {/* ── Account Info (read-only) ── */}
      <ProfileSection title="Account" icon={User}>
        <div className="profile__info-grid">
          <div className="profile__info-item">
            <span className="profile__info-label">Username</span>
            <span className="profile__info-value">{displayName}</span>
          </div>
          <div className="profile__info-item">
            <span className="profile__info-label">Email</span>
            <span className="profile__info-value">{email}</span>
          </div>
          <div className="profile__info-item">
            <span className="profile__info-label">Role</span>
            <span className="profile__info-value">{user?.role || "Student"}</span>
          </div>
        </div>
      </ProfileSection>
    </div>
  );
}
