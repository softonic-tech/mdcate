"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SIDEBAR_LINKS } from "@/lib/constants";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col z-40 transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-border bg-surface-alt">
          <video autoPlay muted loop playsInline className="h-full w-full object-cover">
            <source src="/logo.mp4" type="video/mp4" />
          </video>
        </div>
        {!collapsed && <span className="font-heading font-bold text-lg truncate">medprep.study</span>}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {SIDEBAR_LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-alt hover:text-text-primary"
              )}
              title={collapsed ? link.label : undefined}
            >
              <link.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border p-2 space-y-0.5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-red-50 hover:text-danger transition-colors w-full"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:bg-surface-alt transition-colors w-full"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
