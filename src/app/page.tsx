"use client";

import Link from "next/link";
import { Award, BookOpen, MessageSquareText, TrendingUp, UsersRound } from "lucide-react";
import { CourseCard } from "@/components/course";
import { MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { badges } from "@/data/lms";
import { useLms } from "@/components/LmsProvider";
import { getAnalyticsSummary, getEarnedBadges, getLevelByXp } from "@/lib/lms";

const modules = [
  { title: "Контент", text: "курсы, уроки, тесты", href: "/courses", icon: BookOpen },
  { title: "Геймификация", text: "XP, бейджи, рейтинг", href: "/achievements", icon: Award },
  { title: "Кабинет", text: "план и история обучения", href: "/profile", icon: UsersRound },
  { title: "Аналитика", text: "метрики HR и отделов", href: "/analytics", icon: TrendingUp },
  { title: "Коммуникации", text: "обсуждения и фидбек", href: "/feedback", icon: MessageSquareText }
];

export default function DashboardPage() {
  const { currentUser, state } = useLms();

  if (!currentUser) {
    return null;
  }

  const activeCourseIds = state.progressRecords
    .filter((record) => record.userId === currentUser.id && record.status === "active")
    .map((record) => record.courseId);
  const activeCourses = state.courses.filter((course) => activeCourseIds.includes(course.id));
  const summary = getAnalyticsSummary(state.users, state.courses, state.progressRecords);
  const level = getLevelByXp(currentUser.xp);
  const earnedBadges = getEarnedBadges(currentUser, state.progressRecords, badges);

  return (
    <div className="page page-grid">
      <SectionHeader
        title="Дашборд обучения"
        description="рабочий экран сотрудника: активные курсы, прогресс, награды и быстрый доступ к модулям платформы"
      />

      <section className="metric-grid" aria-label="Сводные показатели">
        <MetricCard label="уровень" value={level.label} note={`${currentUser.xp} XP накоплено`} />
        <MetricCard label="активные курсы" value={currentUser.activeCourses} note="назначены сотруднику" />
        <MetricCard label="бейджи" value={earnedBadges.length} note="получено за обучение" />
        <MetricCard label="завершение" value={`${summary.completionRate}%`} note="по группе обучения" />
      </section>

      <section className="split-grid">
        <div className="card card-pad">
          <SectionHeader title="Активные курсы" description="курсы, которые сотрудник должен пройти в ближайшее время" />
          <div className="course-grid">
            {activeCourses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Личный прогресс" description="путь до следующего уровня" />
          <ProgressBar label={`до уровня «${level.nextLabel ?? level.label}»`} value={level.progressToNext} />
          <div className="chip-row">
            {earnedBadges.slice(0, 4).map((badge) => (
              <StatusPill key={badge.id} tone={badge.tone}>
                {badge.title}
              </StatusPill>
            ))}
          </div>
          <div className="stack">
            {currentUser.notifications.map((notification) => (
              <div className="card card-pad" key={notification}>
                {notification}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section>
        <SectionHeader title="Модули платформы" description="каждый раздел соответствует отдельному дипломному модулю" />
        <div className="module-grid">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link className="module-card stack" href={module.href} key={module.href}>
                <span className="icon-box">
                  <Icon size={19} />
                </span>
                <strong>{module.title}</strong>
                <span className="muted">{module.text}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
