"use client";

import { Award, Medal, Sparkles, Trophy } from "lucide-react";
import { BadgePill, MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { badges, rewardItems } from "@/data/lms";
import { useLms } from "@/components/LmsProvider";
import { getEarnedBadges, getLeaderboard, getLevelByXp } from "@/lib/lms";

export default function AchievementsPage() {
  const { currentUser, state, redeemReward } = useLms();

  if (!currentUser) {
    return null;
  }

  const level = getLevelByXp(currentUser.xp);
  const earnedBadges = getEarnedBadges(currentUser, state.progressRecords, badges);
  const leaderboard = getLeaderboard(state.users);
  const departmentRows = Object.entries(
    state.users.reduce<Record<string, number>>((acc, user) => {
      acc[user.department] = (acc[user.department] ?? 0) + user.xp;
      return acc;
    }, {})
  ).sort((left, right) => right[1] - left[1]);
  const userRedemptions = state.rewardRedemptions.filter((item) => item.userId === currentUser.id);

  return (
    <div className="page page-grid">
      <SectionHeader title="Достижения и геймификация" description="баллы XP, уровни, бейджи, личный прогресс и рейтинги сотрудников" />

      <section className="metric-grid">
        <MetricCard label="текущий уровень" value={level.label} note={`${currentUser.xp} XP`} />
        <MetricCard label="до следующего" value={`${level.progressToNext}%`} note={level.nextLabel ?? "максимальный уровень"} />
        <MetricCard label="бейджи" value={earnedBadges.length} note="получено сотрудником" />
        <MetricCard label="место" value={leaderboard.findIndex((user) => user.id === currentUser.id) + 1} note="в общем рейтинге" />
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Путь уровня" description="визуализация прогресса сотрудника" />
          <div className="row">
            <span className="icon-box">
              <Sparkles size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <ProgressBar label={`до уровня «${level.nextLabel ?? level.label}»`} value={level.progressToNext} />
            </div>
          </div>
          <div className="chip-row">
            {earnedBadges.map((badge) => (
              <BadgePill key={badge.id} tone={badge.tone}>
                <Award size={14} />
                {badge.title}
              </BadgePill>
            ))}
          </div>
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Магазин поощрений" description="обмен накопленных баллов на заявки" />
          {rewardItems.map((reward) => {
            const available = currentUser.xp >= reward.costXp && reward.availableFor.includes(currentUser.role);

            return (
              <div className="list-item reward-row" key={reward.id}>
                <div>
                  <strong>{reward.title}</strong>
                  <p className="item-text">{reward.description}</p>
                  <p className="metric-note">{reward.costXp} XP</p>
                </div>
                <button className="secondary-button" disabled={!available} onClick={() => redeemReward(reward.id)} type="button">
                  обменять
                </button>
              </div>
            );
          })}
          {userRedemptions.length > 0 ? (
            <div className="stack">
              <p className="metric-label">мои заявки</p>
              {userRedemptions.map((item) => {
                const reward = rewardItems.find((record) => record.id === item.rewardId);

                return (
                  <div className="list-item row" key={item.id}>
                    <span>{reward?.title ?? "награда"}</span>
                    <StatusPill tone="orange">на согласовании</StatusPill>
                  </div>
                );
              })}
            </div>
          ) : null}
        </aside>
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Рейтинг сотрудников" />
          {leaderboard.map((user, index) => (
            <div className="leader-row" key={user.id}>
              <span className="rank">{index + 1}</span>
              <div>
                <strong>{user.name}</strong>
                <p className="item-text">{user.department}</p>
              </div>
              <StatusPill tone={index === 0 ? "green" : "blue"}>
                <Trophy size={14} />
                {user.xp} XP
              </StatusPill>
            </div>
          ))}
        </div>

        <div className="card card-pad stack">
          <SectionHeader title="Рейтинг отделов" />
          {departmentRows.map(([department, xp], index) => (
            <div className="leader-row" key={department}>
              <span className="rank">{index + 1}</span>
              <strong>{department}</strong>
              <StatusPill tone="violet">
                <Medal size={14} />
                {xp} XP
              </StatusPill>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
