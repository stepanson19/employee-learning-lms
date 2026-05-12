"use client";

import Link from "next/link";
import { ArrowRight, Award, BarChart3, BookOpen, ClipboardCheck, Database, MessageSquareText, PlusCircle, TrendingUp, UsersRound } from "lucide-react";
import { CourseCard } from "@/components/course";
import { MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { badges } from "@/data/lms";
import { useLms } from "@/components/LmsProvider";
import { canAccessRoute } from "@/lib/auth";
import { getAnalyticsSummary, getEarnedBadges, getLevelByXp } from "@/lib/lms";

const modules = [
  { title: "Контент", text: "курсы, уроки, тесты", href: "/courses", icon: BookOpen },
  { title: "Геймификация", text: "XP, бейджи, рейтинг", href: "/achievements", icon: Award },
  { title: "Кабинет", text: "план и история обучения", href: "/profile", icon: UsersRound },
  { title: "Аналитика", text: "метрики HR и отделов", href: "/analytics", icon: TrendingUp },
  { title: "Коммуникации", text: "обсуждения и фидбек", href: "/feedback", icon: MessageSquareText },
  { title: "Система", text: "статус БД и резервные копии", href: "/system", icon: Database }
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
  const firstActiveCourse = activeCourses[0];
  const activeAssignments = state.courseAssignments.filter((assignment) => assignment.status === "active").length;
  const authoredCourses = state.courses.filter((course) => course.authorId === currentUser.id).length;
  const visibleModules = modules.filter((module) => canAccessRoute(currentUser.role, module.href));
  const dashboardCourses =
    currentUser.role === "employee"
      ? activeCourses
      : state.courses
          .filter((course) => (currentUser.role === "author" ? course.authorId === currentUser.id : course.status === "published"))
          .slice(0, 3);
  const courseSectionTitle = currentUser.role === "employee" ? "Активные курсы" : currentUser.role === "hr" ? "Курсы для назначения" : "Мои материалы";
  const courseSectionDescription =
    currentUser.role === "employee"
      ? "курсы, которые сотрудник должен пройти в ближайшее время"
      : currentUser.role === "hr"
        ? "опубликованные курсы, которые можно назначать сотрудникам"
        : "курсы автора, которые можно редактировать и дополнять тестами";
  const dashboardDescription =
    currentUser.role === "employee"
      ? "рабочий экран сотрудника: активные курсы, прогресс, награды и быстрый доступ к модулям платформы"
      : currentUser.role === "hr"
        ? "рабочий экран HR: контроль прогресса, назначение обучения, аналитика и состояние платформы"
        : "рабочий экран автора: учебные материалы, тесты, публикация курсов и контроль хранилища";
  const secondMetric =
    currentUser.role === "employee"
      ? { label: "активные курсы", value: activeCourses.length, note: "ожидают завершения" }
      : currentUser.role === "hr"
        ? { label: "назначения", value: activeAssignments, note: "активные курсы сотрудников" }
        : { label: "мои курсы", value: authoredCourses, note: "материалы автора" };
  const focus =
    currentUser.role === "employee"
      ? {
          icon: ClipboardCheck,
          title: firstActiveCourse ? "Продолжить назначенное обучение" : "Проверить учебный план",
          text: firstActiveCourse
            ? `${firstActiveCourse.title}: откройте курс, закройте оставшиеся уроки и пройдите тест.`
            : "В учебном плане пока нет активных курсов. Проверьте доступные материалы в каталоге.",
          primaryHref: firstActiveCourse ? `/courses/${firstActiveCourse.slug}` : "/courses",
          primaryLabel: firstActiveCourse ? "открыть курс" : "к каталогу",
          secondaryHref: "/profile",
          secondaryLabel: "мой план"
        }
      : currentUser.role === "hr"
        ? {
            icon: BarChart3,
            title: "Проверить прогресс команды",
            text: "Откройте аналитику, посмотрите просрочки и назначьте нужный курс сотруднику.",
            primaryHref: "/analytics",
            primaryLabel: "аналитика",
            secondaryHref: "/courses",
            secondaryLabel: "назначить курс"
          }
        : {
            icon: PlusCircle,
            title: "Подготовить учебный контент",
            text: "Создайте черновик курса или добавьте вопросы к тесту в уже существующем материале.",
            primaryHref: "/courses",
            primaryLabel: "создать курс",
            secondaryHref: "/system",
            secondaryLabel: "проверить БД"
          };
  const FocusIcon = focus.icon;

  return (
    <div className="page page-grid">
      <SectionHeader
        title="Дашборд обучения"
        description={dashboardDescription}
      />

      <section className="metric-grid" aria-label="Сводные показатели">
        <MetricCard label="уровень" value={level.label} note={`${currentUser.xp} XP накоплено`} />
        <MetricCard label={secondMetric.label} value={secondMetric.value} note={secondMetric.note} />
        <MetricCard label="бейджи" value={earnedBadges.length} note="получено за обучение" />
        <MetricCard label="завершение" value={`${summary.completionRate}%`} note="по группе обучения" />
      </section>

      <section className="focus-panel">
        <div className="icon-box focus-icon">
          <FocusIcon size={22} />
        </div>
        <div>
          <p className="metric-label">следующее действие</p>
          <h2>{focus.title}</h2>
          <p>{focus.text}</p>
        </div>
        <div className="focus-actions">
          <Link className="primary-button" href={focus.primaryHref}>
            {focus.primaryLabel}
            <ArrowRight size={16} />
          </Link>
          <Link className="secondary-button" href={focus.secondaryHref}>
            {focus.secondaryLabel}
          </Link>
        </div>
      </section>

      <section className="split-grid">
        <div className="stack">
          <SectionHeader title={courseSectionTitle} description={courseSectionDescription} />
          <div className="dashboard-course-grid">
            {dashboardCourses.map((course) => (
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
              <div className="list-item" key={notification}>
                {notification}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section>
        <SectionHeader title="Модули платформы" description="каждый раздел соответствует отдельному дипломному модулю" />
        <div className="module-grid">
          {visibleModules.map((module) => {
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
