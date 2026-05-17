"use client";

import Link from "next/link";
import { CalendarClock, CheckCircle2, Clock3, Route, Sparkles } from "lucide-react";
import { BadgePill, MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { badges } from "@/data/lms";
import { useLms } from "@/components/LmsProvider";
import { getEarnedBadges, getLevelByXp } from "@/lib/lms";
import type { ProgressStatus } from "@/types/lms";

const statusLabels: Record<ProgressStatus, string> = {
  active: "в процессе",
  completed: "завершен",
  overdue: "просрочен"
};

const statusTone: Record<ProgressStatus, "blue" | "green" | "red"> = {
  active: "blue",
  completed: "green",
  overdue: "red"
};

export default function ProfilePage() {
  const { currentUser, state } = useLms();

  if (!currentUser) {
    return null;
  }

  const level = getLevelByXp(currentUser.xp);
  const earnedBadges = getEarnedBadges(currentUser, state.progressRecords, badges);
  const userProgress = state.progressRecords.filter((record) => record.userId === currentUser.id);
  const userAssignments = state.courseAssignments.filter((assignment) => assignment.userId === currentUser.id);
  const assignedCourseIds = new Set([...userProgress.map((record) => record.courseId), ...userAssignments.map((assignment) => assignment.courseId)]);
  const progressByCourseId = new Map(userProgress.map((record) => [record.courseId, record]));
  const assignmentByCourseId = new Map(userAssignments.map((assignment) => [assignment.courseId, assignment]));
  const assignedCourses = state.courses.filter((course) => assignedCourseIds.has(course.id));
  const xpHistory = state.xpTransactions.filter((transaction) => transaction.userId === currentUser.id).slice(-5).reverse();
  const learningPlan = assignedCourses
    .map((course) => {
      const progress = progressByCourseId.get(course.id);
      const assignment = assignmentByCourseId.get(course.id);
      const status = progress?.status ?? assignment?.status ?? "active";

      return {
        course,
        dueDate: assignment?.dueDate ?? course.deadline,
        lessonsLabel: progress ? `${progress.completedLessons}/${progress.totalLessons}` : `0/${course.lessons.length}`,
        percent: progress?.percent ?? 0,
        score: progress?.score ?? null,
        status
      };
    })
    .sort((left, right) => Number(left.status === "completed") - Number(right.status === "completed") || left.dueDate.localeCompare(right.dueDate));
  const nextPlan = learningPlan.find((item) => item.status !== "completed") ?? learningPlan[0];
  const averageProgress = Math.round(userProgress.reduce((sum, record) => sum + record.percent, 0) / Math.max(userProgress.length, 1));
  const completedPlanItems = learningPlan.filter((item) => item.status === "completed").length;
  const learningHours = Math.round((userProgress.reduce((sum, record) => sum + record.timeSpentMinutes, 0) / 60) * 10) / 10;

  return (
    <div className="page page-grid">
      <SectionHeader title="Мой кабинет" description="профиль сотрудника, учебный план, история обучения, награды и уведомления" />

      <section className="profile-hero">
        <div className="profile-hero-main">
          <span className="avatar profile-hero-avatar">{currentUser.avatarInitials}</span>
          <div className="stack">
            <p className="metric-label">личный прогресс</p>
            <h2>{currentUser.name}</h2>
            <p>
              {currentUser.position} · {currentUser.department}
            </p>
            <div className="chip-row">
              {currentUser.skills.map((skill) => (
                <StatusPill key={skill}>{skill}</StatusPill>
              ))}
            </div>
            <ProgressBar label={`до уровня «${level.nextLabel ?? level.label}»`} value={level.progressToNext} />
          </div>
        </div>
        <aside className="profile-hero-side">
          <div className="hero-stat">
            <span className="metric-label">уровень</span>
            <strong>{level.label}</strong>
            <span className="muted">{currentUser.xp} XP накоплено</span>
          </div>
          <div className="hero-stat">
            <span className="metric-label">ближайший дедлайн</span>
            <strong>{nextPlan?.dueDate ?? "нет"}</strong>
            <span className="muted">{nextPlan?.course.title ?? "курс не назначен"}</span>
          </div>
        </aside>
      </section>

      <section className="metric-grid">
        <MetricCard label="XP" value={currentUser.xp} note={`${currentUser.weeklyXp} за неделю`} />
        <MetricCard label="прогресс" value={`${averageProgress}%`} note="по активному плану" />
        <MetricCard label="завершено" value={`${completedPlanItems}/${learningPlan.length}`} note="курсов из плана" />
        <MetricCard label="бейджи" value={earnedBadges.length} note="награды профиля" />
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader
            title="Следующий шаг"
            description="ближайший курс из учебного плана сотрудника"
          />
          {nextPlan ? (
            <div className="next-course-panel">
              <span className="icon-box focus-icon">
                <Route size={22} />
              </span>
              <div className="stack">
                <div className="row">
                  <div>
                    <strong>{nextPlan.course.title}</strong>
                    <p className="item-text">
                      {nextPlan.lessonsLabel} уроков · дедлайн {nextPlan.dueDate}
                    </p>
                  </div>
                  <StatusPill tone={statusTone[nextPlan.status]}>{statusLabels[nextPlan.status]}</StatusPill>
                </div>
                <ProgressBar label="прогресс курса" value={nextPlan.percent} />
                <div className="next-course-actions">
                  <span className="muted">следующее действие</span>
                  <Link className="secondary-button" href={`/courses/${nextPlan.course.slug}`}>
                    открыть курс
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="item-text">назначенных курсов пока нет</p>
          )}
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Пульс обучения" description="короткая сводка по активности сотрудника" />
          <div className="insight-item">
            <span className="icon-box icon-box-green">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <strong>{learningHours} ч обучения</strong>
              <p className="item-text">зафиксировано в истории прохождения курсов</p>
            </div>
          </div>
          <div className="insight-item">
            <span className="icon-box">
              <Sparkles size={18} />
            </span>
            <div>
              <strong>{level.progressToNext}% до следующего уровня</strong>
              <p className="item-text">{level.nextLabel ? `цель: уровень «${level.nextLabel}»` : "максимальный уровень уже достигнут"}</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="split-grid">
        <div>
          <SectionHeader title="Учебная дорожная карта" description="назначенные курсы, сроки, прогресс и текущий статус" />
          <div className="learning-plan-list">
            {learningPlan.map((item) => (
              <article className={`learning-plan-card ${item.status}`} key={item.course.id}>
                <div className="row">
                  <div>
                    <strong>{item.course.title}</strong>
                    <p className="item-text">
                      {item.course.category} · {item.course.durationMinutes} мин · {item.lessonsLabel} уроков
                    </p>
                  </div>
                  <StatusPill tone={statusTone[item.status]}>{statusLabels[item.status]}</StatusPill>
                </div>
                <ProgressBar label={`дедлайн ${item.dueDate}${item.score ? ` · балл ${item.score}` : ""}`} value={item.percent} />
                <Link className="filter-link active" href={`/courses/${item.course.slug}`}>
                  открыть курс
                </Link>
              </article>
            ))}
          </div>
        </div>

        <aside className="stack">
          <div className="card card-pad stack">
            <SectionHeader title="Награды" />
            <div className="profile-badge-grid">
              {earnedBadges.map((badge) => (
                <div className="profile-badge-card" key={badge.id}>
                  <BadgePill tone={badge.tone}>
                    <Sparkles size={14} />
                    {badge.title}
                  </BadgePill>
                  <p className="item-text">{badge.description}</p>
                </div>
              ))}
            </div>
            <Link className="filter-link active" href="/achievements">
              открыть рейтинг
            </Link>
          </div>

          <div className="card card-pad stack">
            <SectionHeader title="Уведомления" />
            <ul className="list">
              {currentUser.notifications.map((notification) => (
                <li className="list-item profile-alert" key={notification}>
                  <span className="icon-box icon-box-orange">
                    <CalendarClock size={16} />
                  </span>
                  <span>{notification}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card card-pad stack">
            <SectionHeader title="История XP" />
            {xpHistory.length > 0 ? (
              xpHistory.map((transaction) => (
                <div className="list-item row" key={transaction.id}>
                  <span className="icon-box icon-box-green">
                    <CheckCircle2 size={16} />
                  </span>
                  <div>
                    <strong>{transaction.amount > 0 ? `+${transaction.amount}` : transaction.amount} XP</strong>
                    <p className="item-text">{transaction.description}</p>
                  </div>
                  <span className="muted">{transaction.createdAt}</span>
                </div>
              ))
            ) : (
              <p className="item-text">операций с XP пока нет</p>
            )}
          </div>
        </aside>
      </section>

      <section className="card card-pad table-card">
        <SectionHeader title="История обучения" description="последние результаты по курсам" />
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>курс</th>
                <th>прогресс</th>
                <th>балл</th>
                <th>статус</th>
              </tr>
            </thead>
            <tbody>
              {userProgress.map((record) => {
                const course = state.courses.find((item) => item.id === record.courseId);

                return (
                  <tr key={record.courseId}>
                    <td>{course?.title ?? "курс"}</td>
                    <td>
                      <span className="history-progress">
                        <Clock3 size={14} />
                        {record.percent}%
                      </span>
                    </td>
                    <td>{record.score}</td>
                    <td>
                      <StatusPill tone={statusTone[record.status]}>{statusLabels[record.status]}</StatusPill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
