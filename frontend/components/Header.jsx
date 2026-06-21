"use client";

import { io } from "socket.io-client";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, Search, BellRing, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { getUnreadCount } from "@/api/notification.api";

function Header({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { profile } = useProfile();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const dropdownRef = useRef(null);

  // ── Fetch initial unread count + setup WebSocket ──
  useEffect(() => {
    if (!user?._id) return;

    // 1️⃣ Fetch initial count
    const loadUnread = async () => {
      try {
        const res = await getUnreadCount();
        setUnread(res.data.count || 0);
      } catch (e) {
        console.log("Error fetching unread count:", e);
      }
    };
    loadUnread();

    // 2️⃣ Setup WebSocket
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    // 3️⃣ Listen for updates
    socket.on("unread-count", (count) => {
      setUnread(count);
    });

    // 4️⃣ Cleanup
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const displayName = profile?.username || user?.username || user?.email || "User";
  const avatarUrl = profile?.profilePicture || null;

  return (
    <header className="dash-header">
      <div className="dash-header__left">
        <button className="dash-header__menu-btn" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <Menu size={22} />
        </button>

        {/* Search bar — desktop */}
        <div className={`dash-header__search ${searchOpen ? "dash-header__search--open" : ""}`}>
          <Search size={16} className="dash-header__search-icon" />
          <input type="text" placeholder="Search anything…" className="dash-header__search-input" />
        </div>

        {/* Search toggle — mobile */}
        <button
          className="dash-header__search-toggle"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Toggle search"
        >
          <Search size={20} />
        </button>
      </div>

      <div className="dash-header__right">
        {/* Notifications */}
        <Link href="/dashboard/notifications" className="dash-header__icon-btn relative">
          <BellRing size={20} />
          {unread > 0 && <span className="dash-header__badge">{unread > 99 ? "99+" : unread}</span>}
        </Link>

        {/* Profile dropdown */}
        <div className="dash-header__profile" ref={dropdownRef}>
          <button className="dash-header__profile-btn" onClick={toggleDropdown}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="dash-header__avatar" />
            ) : (
              <div className="dash-header__avatar dash-header__avatar--placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="dash-header__name">{displayName}</span>
            <ChevronDown
              size={14}
              className={`dash-header__chevron ${dropdownOpen ? "dash-header__chevron--open" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="dash-header__dropdown">
              <div className="dash-header__dropdown-header">
                <p className="dash-header__dropdown-name">{displayName}</p>
                <p className="dash-header__dropdown-email">{user?.email || ""}</p>
              </div>
              <div className="dash-header__dropdown-divider" />
              <Link href="/dashboard/profile" className="dash-header__dropdown-item" onClick={() => setDropdownOpen(false)}>
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <Link
                href="/dashboard/notifications"
                className="dash-header__dropdown-item"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <div className="dash-header__dropdown-divider" />
              <button className="dash-header__dropdown-item dash-header__dropdown-item--danger" onClick={logout}>
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(Header);