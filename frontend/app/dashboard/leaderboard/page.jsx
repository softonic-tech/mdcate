"use client";

import { useState, useEffect } from "react";
import { getTopLeaderboard, getMyRank } from "@/api/leaderboard.api";
import { Trophy } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatStrip, ListMeta } from "@/components/dashboard/StudyPageUI";

export default function LeaderboardPage() {
  const [top, setTop] = useState([]);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    getTopLeaderboard()
      .then((r) => setTop(r?.data || []))
      .catch(() => {});
    getMyRank()
      .then((r) => setRank(r?.data))
      .catch(() => {});
  }, []);

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
            { label: "Points", value: rank.points },
          ]}
        />
      )}

      {top.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No rankings yet"
          description="Complete challenges and tests to climb the leaderboard."
        />
      ) : (
        <>
          <ListMeta end={top.length} label="players" />

          {top.length >= 3 && (
            <div className="rank-podium">
              {[1, 0, 2].map((idx) => (
                <div
                  key={top[idx]._id}
                  className={`rank-podium__item ${idx === 0 ? "rank-podium__item--first" : ""}`}
                >
                  <p className="badge badge--dark">#{idx + 1}</p>
                  <p className="data-row__title">{top[idx].username}</p>
                  <p className="data-row__sub">{top[idx].points} pts</p>
                </div>
              ))}
            </div>
          )}

          <div className="data-list">
            {top.slice(top.length >= 3 ? 3 : 0).map((u, i) => {
              const rankNum = top.length >= 3 ? i + 4 : i + 1;
              return (
                <div key={u._id} className="data-row">
                  <span className="data-row__rank">
                    #{rankNum}
                  </span>
                  <div className="data-row__avatar">
                    {u.profilePicture && (
                      <img src={u.profilePicture} alt="" />
                    )}
                  </div>
                  <div className="data-row__main">
                    <p className="data-row__title">{u.username}</p>
                  </div>
                  <span className="badge badge--dark">{u.points} pts</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
