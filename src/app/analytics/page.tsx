"use client";

import { useMemo, useState } from "react";
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
  const rows = getAnalyticsRows(state.users, state.courses, state.progressRecords, {
    department: department === "all" ? undefined : department,
    courseId: courseId === "all" ? undefined : courseId
  });
  const summary = getAnalyticsSummary(
    department === "all" ? state.users : state.users.filter((user) => user.department === department),
    state.courses,
    rows.map((row) => row.record)
  );
  const csvHref = useMemo(() => `data:text/csv;charset=utf-8,${encodeURIComponent(exportAnalyticsCsv(rows))}`, [rows]);
  const departmentStats = (department === "all" ? state.users : state.users.filter((user) => user.department === department)).map((user) => {
    const records = rows.filter((row) => row.user.id === user.id).map((row) => row.record);
    const average = Math.round(records.reduce((sum, record) => sum + record.percent, 0) / Math.max(records.length, 1));

    return {
      user,
      average,
      records
    };
  });

  return (
    <div className="page page-grid">
      <SectionHeader
        title="Аналитика и отчетность"
        description="дашборд HR/руководителя: прогресс сотрудников, результаты тестов, сроки и вовлеченность"
        action={
          <a className="secondary-button" download="learnhub-analytics.csv" href={csvHref}>
            выгрузить CSV
          </a>
        }
      />

      <section className="card card-pad">
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
        <div className="card card-pad table-card">
          <SectionHeader title="Прогресс сотрудников" description="сводка по пользователям и назначенным курсам с учетом фильтров" />
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
            {state.courses.filter((course) => (courseId === "all" ? true : course.id === courseId)).map((course) => (
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
      </section>
    </div>
  );
}
