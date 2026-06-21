"use client";

import { Users, BookOpen, HelpCircle, ClipboardList, Library, Video, Award, Swords, MessageSquare } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { PageLoader } from "@/components/ui/Spinner";
import ErrorState from "@/components/ui/ErrorState";
import { useUsers, useLeaderboard, useContactMessages } from "@/hooks/useResource";
import { subjectHooks, questionHooks, testHooks, bookHooks, videoHooks, badgeHooks, challengeHooks } from "@/hooks/useResource";

export default function DashboardPage() {
  const users = useUsers();
  const subjects = subjectHooks.useList();
  const questions = questionHooks.useList();
  const tests = testHooks.useList();
  const books = bookHooks.useList();
  const videos = videoHooks.useList();
  const badges = badgeHooks.useList();
  const challenges = challengeHooks.useList();
  const contacts = useContactMessages();
  const leaderboard = useLeaderboard(5);

  const loading = users.isLoading || subjects.isLoading;

  if (loading) return <PageLoader />;

  const stats = [
    { label: "Total Users", value: users.data?.count ?? users.data?.data?.length ?? 0, icon: Users, color: "primary" },
    { label: "Subjects", value: subjects.data?.count ?? subjects.data?.data?.length ?? 0, icon: BookOpen, color: "success" },
    { label: "Questions", value: questions.data?.count ?? questions.data?.pagination?.total ?? 0, icon: HelpCircle, color: "warning" },
    { label: "Tests", value: tests.data?.count ?? tests.data?.data?.length ?? 0, icon: ClipboardList, color: "purple" },
    { label: "Books", value: books.data?.count ?? books.data?.pagination?.total ?? 0, icon: Library, color: "accent" },
    { label: "Videos", value: videos.data?.count ?? videos.data?.data?.length ?? 0, icon: Video, color: "danger" },
    { label: "Badges", value: badges.data?.count ?? badges.data?.data?.length ?? 0, icon: Award, color: "warning" },
    { label: "Challenges", value: challenges.data?.count ?? challenges.data?.data?.length ?? 0, icon: Swords, color: "success" },
  ];

  const pendingMessages = (contacts.data?.data || []).filter((m) => m.status === "pending").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Contact Messages */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={18} className="text-warning" />
            <h2 className="font-heading font-semibold">Pending Messages</h2>
            {pendingMessages > 0 && (
              <span className="bg-warning/10 text-warning text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingMessages}
              </span>
            )}
          </div>
          {pendingMessages === 0 ? (
            <p className="text-sm text-text-muted">No pending messages</p>
          ) : (
            <ul className="space-y-2">
              {(contacts.data?.data || [])
                .filter((m) => m.status === "pending")
                .slice(0, 5)
                .map((m) => (
                  <li key={m._id} className="text-sm text-text-secondary flex justify-between">
                    <span className="truncate">{m.subject}</span>
                    <span className="text-text-muted text-xs">{m.email}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Leaderboard */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-primary" />
            <h2 className="font-heading font-semibold">Top Students</h2>
          </div>
          {leaderboard.data?.data?.length ? (
            <ol className="space-y-2">
              {leaderboard.data.data.map((u, i) => (
                <li key={u._id} className="flex items-center gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-text-primary">{u.username || u.email}</span>
                  <span className="text-text-muted font-medium">{u.points} pts</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-text-muted">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
