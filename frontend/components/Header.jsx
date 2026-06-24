"use client";

import { io } from "socket.io-client";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, Search, BellRing, ChevronDown, User, Settings, LogOut, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/context/ProfileContext";
import { useDashboardSearch } from "@/context/DashboardSearchContext";
import { getUnreadCount } from "@/api/notification.api";
import { subscribeUnreadCount } from "@/utils/notificationEvents";

function Header({ onMenuToggle, sidebarOpen = false }) {
  const { user, logout } = useAuth();
  const { profile } = useProfile();
  const { query, setQuery, clearQuery, placeholder, enabled } = useDashboardSearch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const dropdownRef = useRef(null);
  const searchAreaRef = useRef(null);
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!userId) return;

    const loadUnread = async () => {
      try {
        const res = await getUnreadCount();
        setUnread(res?.data?.count ?? 0);
      } catch (e) {
        console.log("Error fetching unread count:", e);
      }
    };
    loadUnread();

    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") || "http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });

    socket.on("unread-count", (count) => {
      setUnread(Number(count) || 0);
    });

    socket.on("notification:new", () => {
      loadUnread();
    });

    const unsubLocal = subscribeUnreadCount(setUnread);

    return () => {
      unsubLocal();
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (e) => {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (!enabled) setSearchOpen(false);
  }, [enabled]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dash-search-open",
      Boolean(searchOpen && enabled)
    );
    return () => document.documentElement.classList.remove("dash-search-open");
  }, [searchOpen, enabled]);

  useEffect(() => {
    if (sidebarOpen) setSearchOpen(false);
  }, [sidebarOpen]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  const handleMenuClick = useCallback(() => {
    setDropdownOpen(false);
    setSearchOpen(false);
    onMenuToggle();
  }, [onMenuToggle]);

  const displayName = profile?.username || user?.username || user?.email || "User";
  const avatarUrl = profile?.profilePicture || null;

  return (
    <header className={`dash-header${searchOpen && enabled ? " dash-header--search-open" : ""}`}>
      <div className="dash-header__left" ref={searchAreaRef}>
        <button
          type="button"
          className="dash-header__menu-btn"
          onClick={handleMenuClick}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
          aria-controls="dash-sidebar"
        >
          <Menu size={22} />
        </button>

        {enabled && (
          <>
            <div className={`dash-header__search ${searchOpen ? "dash-header__search--open" : ""}`}>
              <Search size={16} className="dash-header__search-icon" aria-hidden="true" />
              <input
                type="search"
                placeholder={placeholder}
                className="dash-header__search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={placeholder}
              />
              {query && (
                <button
                  type="button"
                  className="dash-header__search-clear"
                  onClick={clearQuery}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            <button
              type="button"
              className={`dash-header__search-toggle${searchOpen ? " dash-header__search-toggle--active" : ""}`}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
          </>
        )}
      </div>

      <div className="dash-header__right">
        <ThemeToggle className="dash-header__icon-btn theme-toggle" size={18} />

        <Link
          href="/dashboard/notifications"
          className="dash-header__icon-btn relative"
          aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
        >
          <BellRing size={20} />
          {unread > 0 && (
            <span className="dash-header__badge">{unread > 99 ? "99+" : unread}</span>
          )}
        </Link>

        <div className="dash-header__profile" ref={dropdownRef}>
          <button
            type="button"
            className="dash-header__profile-btn"
            onClick={toggleDropdown}
            aria-label="Account menu"
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="dash-header__avatar" />
            ) : (
              <div className="dash-header__avatar dash-header__avatar--placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="dash-header__name">{displayName}</span>
            <ChevronDown
              size={14}
              className={`dash-header__chevron ${dropdownOpen ? "dash-header__chevron--open" : ""}`}
              aria-hidden="true"
            />
          </button>

          {dropdownOpen && (
            <div className="dash-header__dropdown" role="menu">
              <div className="dash-header__dropdown-header">
                <p className="dash-header__dropdown-name">{displayName}</p>
                <p className="dash-header__dropdown-email">{user?.email || ""}</p>
              </div>
              <div className="dash-header__dropdown-divider" />
              <Link
                href="/dashboard/profile"
                className="dash-header__dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <Link
                href="/dashboard/notifications"
                className="dash-header__dropdown-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={16} />
                <span>Settings</span>
              </Link>
              <div className="dash-header__dropdown-divider" />
              <button
                type="button"
                className="dash-header__dropdown-item dash-header__dropdown-item--danger"
                role="menuitem"
                onClick={logout}
              >
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
