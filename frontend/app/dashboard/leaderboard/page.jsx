"use client";

import { useState, useEffect, useMemo } from "react";
import { getTopLeaderboard, getMyRank } from "@/api/leaderboard.api";
import { useAuth } from "@/context/AuthContext";
import { Crown, Medal, Award, Trophy, User } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatStrip, ListMeta } from "@/components/dashboard/StudyPageUI";

const PODIUM_SLOTS = [
  { userIndex: 1, rank: 2, place: "second", Icon: Medal, label: "2nd" },
  { userIndex: 0, rank: 1, place: "first", Icon: Crown, label: "1st" },
  { userIndex: 2, rank: 3, place: "third", Icon: Award, label: "3rd" },
];

function PodiumAvatar({ user }) {
  if (user?.profilePicture) {
    return (
      <div className="rank-podium__avatar">
        <img src={user.profilePicture} alt="" />
      </div>
    );
  }

  const initial = (user?.username || "?").charAt(0).toUpperCase();
  return (
    <div className="rank-podium__avatar rank-podium__avatar--initials" aria-hidden="true">
      {initial}
    </div>
  );
}

function PodiumCard({ user, place, Icon, label }) {
  if (!user) return null;

  return (
    <article className={`rank-podium__item rank-podium__item--${place}`}>
      <div className={`rank-podium__icon rank-podium__icon--${place}`} aria-hidden="true">
        <Icon size={place === "first" ? 28 : 22} strokeWidth={1.8} />
      </div>
      <span className="rank-podium__badge">{label}</span>
      <PodiumAvatar user={user} />
      <p className="rank-podium__name">{user.username}</p>
      <p className="rank-podium__points">
        <Trophy size={14} aria-hidden="true" />
        {user.points?.toLocaleString()} pts
      </p>
      {user.streak > 0 && (
        <p className="rank-podium__streak">{user.streak} day streak</p>
      )}
    </article>
  );
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [top, setTop] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTopLeaderboard(0).then((r) => setTop(r?.data || [])),
      getMyRank().then((r) => setRank(r?.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rest = useMemo(() => (top.length >= 3 ? top.slice(3) : top), [top]);

  const isCurrentUser = (entry) =>
    currentUser?._id && String(entry._id) === String(currentUser._id);

  return (
    <div className="page-shell study-page">
      <PageHeader
        eyebrow={{ icon: Trophy, label: "Rankings" }}
        title="Leaderboard"
        description="See how you compare with other MDCAT aspirants."
      />

      {rank && (
        <StatStrip
          items={[
            { label: "Your rank", value: `#${rank.rank}`, accent: true },
            { label: "Points", value: rank.points?.toLocaleString() },
            ...(rank.streak ? [{ label: "Streak", value: `${rank.streak} days` }] : []),
          ]}
        />
      )}

      {loading ? (
        <p className="text-muted">Loading rankings…</p>
      ) : top.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No rankings yet"
          description="Complete challenges and tests to climb the leaderboard."
        />
      ) : (
        <>
          <ListMeta end={top.length} label="players" />

          {top.length >= 3 && (
            <div className="rank-podium" aria-label="Top three players">
              {PODIUM_SLOTS.map(({ userIndex, rank: rankNum, place, Icon, label }) => (
                <PodiumCard
                  key={place}
                  user={top[userIndex]}
                  place={place}
                  Icon={Icon}
                  label={label}
                />
              ))}
            </div>
          )}

          <div className="leaderboard-list">
            <h3 className="leaderboard-list__heading">
              {top.length >= 3 ? "All players" : "Rankings"}
            </h3>
            <div className="data-list">
              {(top.length >= 3 ? rest : top).map((entry, i) => {
                const rankNum = top.length >= 3 ? i + 4 : i + 1;
                const highlighted = isCurrentUser(entry);

                return (
                  <div
                    key={entry._id}
                    className={`data-row leaderboard-row${highlighted ? " leaderboard-row--me" : ""}`}
                  >
                    <span className="data-row__rank">#{rankNum}</span>
                    <div className="data-row__avatar">
                      {entry.profilePicture ? (
                        <img src={entry.profilePicture} alt="" />
                      ) : (
                        <span className="data-row__avatar-fallback" aria-hidden="true">
                          <User size={16} />
                        </span>
                      )}
                    </div>
                    <div className="data-row__main">
                      <p className="data-row__title">
                        {entry.username}
                        {highlighted && <span className="leaderboard-row__you">You</span>}
                      </p>
                      {entry.streak > 0 && (
                        <p className="data-row__sub">{entry.streak} day streak</p>
                      )}
                    </div>
                    <span className="badge badge--dark">{entry.points?.toLocaleString()} pts</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
