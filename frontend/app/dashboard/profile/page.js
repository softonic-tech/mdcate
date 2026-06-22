"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Camera,
  Trash2,
  Edit3,
  Save,
  X,
  User,
  Mail,
  GraduationCap,
  FileText,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Target,
  Shield,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/dashboard/CustomSelect";
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
import { StatStrip } from "@/components/dashboard/StudyPageUI";

function ProfileSection({ title, icon: Icon, onEdit, editing, children, className = "" }) {
  return (
    <section className={`profile-card ${className}`.trim()}>
      <header className="profile-card__head">
        <div className="profile-card__title-wrap">
          <span className="profile-card__icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.8} />
          </span>
          <h2 className="profile-card__title">{title}</h2>
        </div>
        {onEdit && !editing && (
          <button type="button" className="btn-ghost profile-card__edit" onClick={onEdit}>
            <Edit3 size={14} />
            Edit
          </button>
        )}
      </header>
      <div className="profile-card__body">{children}</div>
    </section>
  );
}

function InfoTile({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="profile-tile">
      <span className="profile-tile__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="profile-tile__content">
        <span className="profile-tile__label">{label}</span>
        <span className="profile-tile__value">{value}</span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfilePicture } = useProfile();

  const fileInputRef = useRef(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [bio, setBio] = useState("");
  const [bioEditing, setBioEditing] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioFetched, setBioFetched] = useState(false);

  const [academic, setAcademic] = useState({
    institution: "",
    board: "",
    year: "",
    targetExam: "",
  });
  const [acadEditing, setAcadEditing] = useState(false);
  const [acadLoading, setAcadLoading] = useState(false);
  const [acadFetched, setAcadFetched] = useState(false);

  useEffect(() => {
    if (bioFetched) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getBioApi();
        if (!cancelled) setBio(res?.data?.bio || res?.bio || "");
      } catch {
        /* no bio yet */
      } finally {
        if (!cancelled) setBioFetched(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bioFetched]);

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
      } catch {
        /* no academic info yet */
      } finally {
        if (!cancelled) setAcadFetched(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [acadFetched]);

  const handleAvatarUpload = useCallback(
    async (e) => {
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
    },
    [profile?.profilePicture, updateProfilePicture]
  );

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
  const role = user?.role || "Student";

  const hasPhoto = Boolean(profile?.profilePicture);
  const hasBio = Boolean(bio?.trim());
  const acadCount = [academic.institution, academic.board, academic.year, academic.targetExam].filter(
    Boolean
  ).length;
  const hasAcademic = acadCount > 0;

  const completion = useMemo(() => {
    let score = 0;
    if (hasPhoto) score += 25;
    if (hasBio) score += 25;
    score += Math.round((acadCount / 4) * 25);
    if (displayName && email) score += 25;
    return score;
  }, [hasPhoto, hasBio, acadCount, displayName, email]);

  const statItems = useMemo(
    () => [
      {
        label: "Profile strength",
        value: `${completion}%`,
        accent: true,
        progress: completion,
      },
      {
        label: "Photo",
        value: hasPhoto ? "Added" : "Missing",
        success: hasPhoto,
      },
      {
        label: "Bio",
        value: hasBio ? "Added" : "Empty",
        success: hasBio,
      },
      {
        label: "Academic",
        value: hasAcademic ? `${acadCount}/4 fields` : "Not set",
        success: acadCount === 4,
      },
    ],
    [completion, hasPhoto, hasBio, hasAcademic, acadCount]
  );

  return (
    <div className="page-shell study-page profile-page">
      <section className="profile-hero">
        <div className="profile-hero__glow" aria-hidden="true" />
        <div className="profile-hero__main">
          <div className="profile-hero__avatar-wrap">
            {avatarLoading ? (
              <div className="profile-hero__avatar profile-hero__avatar--loading">
                <Loader2 size={32} className="spin" />
              </div>
            ) : profile?.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={displayName}
                className="profile-hero__avatar"
              />
            ) : (
              <div className="profile-hero__avatar profile-hero__avatar--placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <button
              type="button"
              className="profile-hero__camera"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              disabled={avatarLoading}
            >
              <Camera size={15} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="profile-hero__info">
            <span className="badge badge--neutral profile-hero__role">{role}</span>
            <h1 className="profile-hero__name">{displayName}</h1>
            <p className="profile-hero__email">
              <Mail size={15} aria-hidden="true" />
              {email}
            </p>
            <div className="profile-hero__actions">
              <button
                type="button"
                className="btn-primary profile-hero__btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
              >
                <Camera size={15} />
                {hasPhoto ? "Change photo" : "Upload photo"}
              </button>
              {hasPhoto && (
                <button
                  type="button"
                  className="btn-ghost profile-hero__btn profile-hero__btn--danger"
                  onClick={handleAvatarDelete}
                  disabled={avatarLoading}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-hero__meter">
          <div className="profile-hero__meter-head">
            <span>Profile completion</span>
            <strong>{completion}%</strong>
          </div>
          <div
            className="profile-hero__meter-bar"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="profile-hero__meter-fill" style={{ width: `${completion}%` }} />
          </div>
          <ul className="profile-hero__checklist">
            <li className={hasPhoto ? "profile-hero__check--done" : ""}>
              {hasPhoto ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              Profile photo
            </li>
            <li className={hasBio ? "profile-hero__check--done" : ""}>
              {hasBio ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              Bio
            </li>
            <li className={acadCount === 4 ? "profile-hero__check--done" : ""}>
              {acadCount === 4 ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              Academic details
            </li>
          </ul>
        </div>
      </section>

      <StatStrip items={statItems} />

      <div className="profile-grid">
        <ProfileSection
          title="About you"
          icon={FileText}
          onEdit={() => setBioEditing(true)}
          editing={bioEditing}
        >
          {bioEditing ? (
            <div className="profile-form">
              <textarea
                className="profile-form__textarea"
                placeholder="Tell us about your MDCAT journey, goals, or interests…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <p className="profile-form__hint">{bio.length}/500 characters</p>
              <div className="profile-form__actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleBioSave}
                  disabled={bioLoading}
                >
                  {bioLoading ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                  Save bio
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setBioEditing(false)}
                  disabled={bioLoading}
                >
                  <X size={14} /> Cancel
                </button>
                {bio && (
                  <button
                    type="button"
                    className="btn-ghost profile-form__danger"
                    onClick={handleBioDelete}
                    disabled={bioLoading}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>
          ) : bio ? (
            <p className="profile-bio">{bio}</p>
          ) : (
            <p className="profile-empty">
              No bio yet — add a short intro so others know what you&apos;re preparing for.
            </p>
          )}
        </ProfileSection>

        <ProfileSection
          title="Academic info"
          icon={GraduationCap}
          onEdit={() => setAcadEditing(true)}
          editing={acadEditing}
        >
          {acadEditing ? (
            <div className="profile-form">
              <div className="profile-form__grid">
                <label className="profile-form__field">
                  <span>Institution</span>
                  <input
                    type="text"
                    placeholder="e.g. Cadet College Razmak"
                    value={academic.institution}
                    onChange={(e) => handleAcadChange("institution", e.target.value)}
                  />
                </label>
                <label className="profile-form__field">
                  <span>Board</span>
                  <CustomSelect
                    value={academic.board}
                    onChange={(e) => handleAcadChange("board", e.target.value)}
                  >
                    <option value="">Select board</option>
                    <option value="KPK">KPK</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Federal">Federal</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="AJK">AJK</option>
                  </CustomSelect>
                </label>
                <label className="profile-form__field">
                  <span>Year / Class</span>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Year / 12th"
                    value={academic.year}
                    onChange={(e) => handleAcadChange("year", e.target.value)}
                  />
                </label>
                <label className="profile-form__field">
                  <span>Target exam</span>
                  <CustomSelect
                    value={academic.targetExam}
                    onChange={(e) => handleAcadChange("targetExam", e.target.value)}
                  >
                    <option value="">Select exam</option>
                    <option value="MDCAT">MDCAT</option>
                    <option value="ECAT">ECAT</option>
                    <option value="NTS">NTS</option>
                    <option value="Other">Other</option>
                  </CustomSelect>
                </label>
              </div>
              <div className="profile-form__actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAcadSave}
                  disabled={acadLoading}
                >
                  {acadLoading ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                  Save details
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setAcadEditing(false)}
                  disabled={acadLoading}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : hasAcademic ? (
            <div className="profile-tiles">
              <InfoTile icon={Building2} label="Institution" value={academic.institution} />
              <InfoTile icon={MapPin} label="Board" value={academic.board} />
              <InfoTile icon={Calendar} label="Year / Class" value={academic.year} />
              <InfoTile icon={Target} label="Target exam" value={academic.targetExam} />
            </div>
          ) : (
            <p className="profile-empty">
              Add your school, board, and target exam to personalize your prep experience.
            </p>
          )}
        </ProfileSection>

        <ProfileSection title="Account" icon={Shield} className="profile-grid__full">
          <div className="profile-tiles profile-tiles--account">
            <InfoTile icon={User} label="Username" value={displayName} />
            <InfoTile icon={Mail} label="Email" value={email} />
            <InfoTile icon={Shield} label="Role" value={role} />
          </div>
        </ProfileSection>
      </div>
    </div>
  );
}
