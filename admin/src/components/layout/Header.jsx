"use client";

import { useAuth } from "@/providers/AuthProvider";
import { getInitials } from "@/lib/utils";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-text-primary">{user?.username || "Admin"}</p>
          <p className="text-xs text-text-muted">{user?.email}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
          {getInitials(user?.username || "A")}
        </div>
      </div>
    </header>
  );
}
