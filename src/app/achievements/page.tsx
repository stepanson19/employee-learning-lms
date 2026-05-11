import { Award, Medal, Sparkles, Trophy } from "lucide-react";
import { BadgePill, MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { badges, progressRecords, users } from "@/data/lms";
import { getEarnedBadges, getLeaderboard, getLevelByXp } from "@/lib/lms";

const currentUser = users.find((user) => user.id === "u-employee") ?? users[0];
const level = getLevelByXp(currentUser.xp);
const earnedBadges = getEarnedBadges(currentUser, progressRecords, badges);
const leaderboard = getLeaderboard(users);
const departmentRows = Object.entries(
  users.reduce<Record<string, number>>((acc, user) => {
    acc[user.department] = (acc[user.department] ?? 0) + user.xp;
    return acc;
  }, {})
).sort((left, right) => right[1] - left[1]);

export default function AchievementsPage() {
  return (
    <div className="page page-grid">
      <SectionHeader
        title="Достижения и геймификация"
        description="баллы XP, уровни, бейджи, личный прогресс и рейтинги сотрудников"
      />

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
          <SectionHeader title="Магазин поощрений" description="варианты обмена накопленных баллов" />
          {["фирменный мерч — 450 XP", "дополнительное обучение — 700 XP", "день без встреч — 900 XP"].map((reward) => (
            <div className="list-item row" key={reward}>
              <span>{reward}</span>
              <StatusPill tone="orange">доступно</StatusPill>
            </div>
          ))}
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
