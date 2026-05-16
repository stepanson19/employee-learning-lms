"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Filter, TrendingUp } from "lucide-react";
import { MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";
import { exportAnalyticsCsv, getAnalyticsRows, getAnalyticsSummary } from "@/lib/lms";

const statusLabels = {
  draft: "черновик",
  review: "на проверке",
  published: "опубликован",
  archived: "архив"
} as const;

export default function AnalyticsPage() {
  const { state } = useLms();
  const [department, setDepartment] = useState("all");
  const [courseId, setCourseId] = useState("all");
  const departments = Array.from(new Set(state.users.map((user) => user.department)));
  const filteredUsers = department === "all" ? state.users : state.users.filter((user) => user.department === department);
  const filteredCourses = state.courses.filter((course) => (courseId === "all" ? true : course.id === courseId));
  const rows = getAnalyticsRows(state.users, state.courses, state.progressRecords, {
    department: department === "all" ? undefined : department,
    courseId: courseId === "all" ? undefined : courseId
  });
  const summary = getAnalyticsSummary(
    filteredUsers,
    state.courses,
    rows.map((row) => row.record)
  );
  const csvHref = useMemo(() => `data:text/csv;charset=utf-8,${encodeURIComponent(exportAnalyticsCsv(rows))}`, [rows]);
  const departmentStats = filteredUsers.map((user) => {
    const records = rows.filter((row) => row.user.id === user.id).map((row) => row.record);
    const average = Math.round(records.reduce((sum, record) => sum + record.percent, 0) / Math.max(records.length, 1));

    return {
      user,
      average,
      records
    };
  });
  const overdueRows = rows.filter((row) => row.record.status === "overdue");
  const slowRows = rows.filter((row) => row.record.percent < 60 && row.record.status !== "completed");
  const attentionRows = [...overdueRows, ...slowRows.filter((slowRow) => !overdueRows.some((row) => row.user.id === slowRow.user.id && row.course.id === slowRow.course.id))].slice(0, 4);
  const teamHealthTone = overdueRows.length > 0 ? "red" : summary.engagementRate < 60 ? "orange" : "green";
  const teamHealthLabel = overdueRows.length > 0 ? "есть риски по срокам" : summary.engagementRate < 60 ? "нужно поднять активность" : "обучение в графике";
  const coursePerformance = filteredCourses.slice(0, 4).map((course) => {
    const courseRows = rows.filter((row) => row.course.id === course.id);
    const averageProgress = Math.round(courseRows.reduce((sum, row) => sum + row.record.percent, 0) / Math.max(courseRows.length, 1));
    const averageScore = Math.round(courseRows.reduce((sum, row) => sum + row.record.score, 0) / Math.max(courseRows.length, 1));

    return {
      course,
      averageProgress,
      averageScore,
      learners: courseRows.length
    };
  });

  return (
    <div className="page page-grid">
      <SectionHeader
        title="Аналитика и отчетность"
        description="дашборд HR/руководителя: прогресс сотрудников, результаты тестов, сроки и вовлеченность"
        action={
          <a className="secondary-button" download="learnhub-analytics.csv" href={csvHref}>
            <Download size={16} />
            выгрузить CSV
          </a>
        }
      />

      <section className="analytics-hero">
        <div className="analytics-hero-main">
          <span className="icon-box focus-icon">
            <TrendingUp size={22} />
          </span>
          <div className="stack">
            <p className="metric-label">состояние обучения</p>
            <h2>{teamHealthLabel}</h2>
            <p>
              в отчете {rows.length} прохождений, {filteredUsers.length} сотрудников и {filteredCourses.length} курсов с учетом выбранных фильтров
            </p>
            <ProgressBar label="вовлеченность по выбранному сегменту" value={summary.engagementRate} />
          </div>
        </div>
        <aside className="analytics-hero-side">
          <div className="hero-stat">
            <span className="metric-label">просрочки</span>
            <strong>{overdueRows.length}</strong>
            <StatusPill tone={teamHealthTone}>{teamHealthLabel}</StatusPill>
          </div>
          <div className="hero-stat">
            <span className="metric-label">завершение</span>
            <strong>{summary.completionRate}%</strong>
            <span className="muted">доля завершенных прохождений</span>
          </div>
        </aside>
      </section>

      <section className="card card-pad">
        <div className="row">
          <span className="metric-label">
            <Filter size={14} />
            фильтры отчета
          </span>
          <span className="muted">{rows.length} записей найдено</span>
        </div>
        <div className="toolbar-row">
          <label>
            <span className="metric-label">отдел</span>
            <select className="select" onChange={(event) => setDepartment(event.target.value)} value={department}>
              <option value="all">все отделы</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="metric-label">курс</span>
            <select className="select" onChange={(event) => setCourseId(event.target.value)} value={courseId}>
              <option value="all">все курсы</option>
              {state.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="завершение" value={`${summary.completionRate}%`} note="по всем прохождениям" />
        <MetricCard label="средний балл" value={summary.averageScore} note="за тесты" />
        <MetricCard label="активные" value={summary.activeLearners} note="сотрудника учатся" />
        <MetricCard label="время" value={`${summary.totalTimeHours} ч`} note="потрачено на обучение" />
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Зона внимания" description="сотрудники и курсы, где HR стоит проверить срок или прогресс" />
          {attentionRows.length > 0 ? (
            <div className="insight-list">
              {attentionRows.map((row) => (
                <div className="insight-item" key={`${row.user.id}-${row.course.id}`}>
                  <span className={row.record.status === "overdue" ? "icon-box icon-box-red" : "icon-box icon-box-orange"}>
                    <AlertTriangle size={18} />
                  </span>
                  <div>
                    <strong>{row.user.name}</strong>
                    <p className="item-text">
                      {row.course.title} · {row.record.percent}% · {row.record.status === "overdue" ? "просрочка" : "низкий прогресс"}
                    </p>
                  </div>
                  <StatusPill tone={row.record.status === "overdue" ? "red" : "orange"}>{row.record.status === "overdue" ? "срочно" : "контроль"}</StatusPill>
                </div>
              ))}
            </div>
          ) : (
            <div className="insight-item">
              <span className="icon-box icon-box-green">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <strong>критичных рисков нет</strong>
                <p className="item-text">по выбранному фильтру сотрудники идут без просрочек и сильного отставания</p>
              </div>
            </div>
          )}
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Эффективность курсов" description="быстрая оценка прогресса и среднего балла" />
          <div className="course-performance-list">
            {coursePerformance.map(({ course, averageProgress, averageScore, learners }) => (
              <div className="course-performance-item" key={course.id}>
                <div className="row">
                  <strong>{course.title}</strong>
                  <StatusPill tone={averageProgress >= 80 ? "green" : averageProgress >= 50 ? "orange" : "red"}>{averageProgress}%</StatusPill>
                </div>
                <ProgressBar label={`${learners} прохождений · средний балл ${averageScore || "—"}`} value={averageProgress} />
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="split-grid">
        <div className="card card-pad table-card">
          <SectionHeader title="Прогресс сотрудников" description="сводка по пользователям и назначенным курсам с учетом фильтров" />
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>сотрудник</th>
                  <th>отдел</th>
                  <th>прогресс</th>
                  <th>статус</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map(({ user, average, records }) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.department}</td>
                    <td>
                      <ProgressBar value={average} />
                    </td>
                    <td>
                      <StatusPill tone={records.some((record) => record.status === "overdue") ? "red" : "green"}>
                        {records.some((record) => record.status === "overdue") ? "есть просрочка" : "в графике"}
                      </StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Вовлеченность" description="как сотрудники взаимодействуют с обучением" />
          <ProgressBar label="активность по опубликованным курсам" value={summary.engagementRate} />
          <div className="list-item">
            <strong>прохождений в отчете</strong>
            <p className="item-text">{rows.length} записей после фильтрации</p>
          </div>
          <div className="list-item">
            <strong>активные назначения</strong>
            <p className="item-text">{state.courseAssignments.filter((assignment) => assignment.status === "active").length} курсов ожидают завершения</p>
          </div>
        </aside>
      </section>

      <section className="card card-pad table-card">
        <SectionHeader title="Отчет по курсам" description="данные для контроля HR и руководителя" />
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>курс</th>
                <th>категория</th>
                <th>статус</th>
                <th>дедлайн</th>
                <th>XP</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.category}</td>
                  <td>
                    <StatusPill tone={course.status === "published" ? "green" : course.status === "review" ? "orange" : "blue"}>
                      {statusLabels[course.status]}
                    </StatusPill>
                  </td>
                  <td>{course.deadline}</td>
                  <td>{course.xpReward}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
