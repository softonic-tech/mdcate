"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getProfileApi } from "@/api/user.api";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    let cancelled = false;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await getProfileApi();
        if (!cancelled) setProfile(res?.data || res || null);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [user]);

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : updates));
  }, []);

  const updateProfilePicture = useCallback((url) => {
    setProfile((prev) => (prev ? { ...prev, profilePicture: url } : { profilePicture: url }));
  }, []);

  const value = useMemo(
    () => ({ profile, profileLoading, updateProfile, updateProfilePicture, setProfile }),
    [profile, profileLoading, updateProfile, updateProfilePicture]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};
