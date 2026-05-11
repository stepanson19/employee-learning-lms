import { MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { courses, progressRecords, users } from "@/data/lms";
import { getAnalyticsSummary } from "@/lib/lms";

const summary = getAnalyticsSummary(users, courses, progressRecords);
const statusLabels = {
  draft: "черновик",
  review: "на проверке",
  published: "опубликован",
  archived: "архив"
} as const;

const departmentStats = users.map((user) => {
  const records = progressRecords.filter((record) => record.userId === user.id);
  const average = Math.round(records.reduce((sum, record) => sum + record.percent, 0) / Math.max(records.length, 1));

  return {
    user,
    average,
    records
  };
});

export default function AnalyticsPage() {
  return (
    <div className="page page-grid">
      <SectionHeader
        title="Аналитика и отчетность"
        description="дашборд HR/руководителя: прогресс сотрудников, результаты тестов, сроки и вовлеченность"
      />

      <section className="metric-grid">
        <MetricCard label="завершение" value={`${summary.completionRate}%`} note="по всем прохождениям" />
        <MetricCard label="средний балл" value={summary.averageScore} note="за тесты" />
        <MetricCard label="активные" value={summary.activeLearners} note="сотрудника учатся" />
        <MetricCard label="время" value={`${summary.totalTimeHours} ч`} note="потрачено на обучение" />
      </section>

      <section className="split-grid">
        <div className="card card-pad">
          <SectionHeader title="Прогресс сотрудников" description="сводка по пользователям и назначенным курсам" />
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
            <strong>лучший курс</strong>
            <p className="item-text">Быстрый старт сотрудника — самый высокий прогресс</p>
          </div>
          <div className="list-item">
            <strong>зона внимания</strong>
            <p className="item-text">курс по безопасности требует напоминаний для поддержки</p>
          </div>
        </aside>
      </section>

      <section className="card card-pad">
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
            {courses.map((course) => (
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
