import Link from "next/link";
import { CourseCard } from "@/components/course";
import { BadgePill, MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { badges, courses, progressRecords, users } from "@/data/lms";
import { getEarnedBadges, getLevelByXp } from "@/lib/lms";

const currentUser = users.find((user) => user.id === "u-employee") ?? users[0];
const level = getLevelByXp(currentUser.xp);
const earnedBadges = getEarnedBadges(currentUser, progressRecords, badges);
const userProgress = progressRecords.filter((record) => record.userId === currentUser.id);
const assignedCourses = courses.filter((course) => userProgress.some((record) => record.courseId === course.id));

export default function ProfilePage() {
  return (
    <div className="page page-grid">
      <SectionHeader
        title="Мой кабинет"
        description="профиль сотрудника, учебный план, история обучения, награды и уведомления"
      />

      <section className="split-grid">
        <div className="card card-pad stack">
          <div className="profile-card">
            <span className="avatar">{currentUser.avatarInitials}</span>
            <div>
              <h2 className="section-title">{currentUser.name}</h2>
              <p className="section-description">
                {currentUser.position} · {currentUser.department}
              </p>
              <div className="chip-row" style={{ marginTop: 12 }}>
                {currentUser.skills.map((skill) => (
                  <StatusPill key={skill}>{skill}</StatusPill>
                ))}
              </div>
            </div>
          </div>
          <ProgressBar label={`уровень «${level.label}»`} value={level.progressToNext} />
        </div>

        <div className="metric-grid">
          <MetricCard label="XP" value={currentUser.xp} note={`${currentUser.weeklyXp} за неделю`} />
          <MetricCard label="курсы" value={currentUser.activeCourses} note="в учебном плане" />
          <MetricCard label="завершено" value={currentUser.completedCourses} note="курса пройдено" />
          <MetricCard label="бейджи" value={earnedBadges.length} note="награды профиля" />
        </div>
      </section>

      <section className="split-grid">
        <div>
          <SectionHeader title="План развития" description="назначенные и доступные курсы сотрудника" />
          <div className="course-grid">
            {assignedCourses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
          </div>
        </div>

        <aside className="stack">
          <div className="card card-pad stack">
            <SectionHeader title="Награды" />
            <div className="chip-row">
              {earnedBadges.map((badge) => (
                <BadgePill key={badge.id} tone={badge.tone}>
                  {badge.title}
                </BadgePill>
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
                <li className="list-item" key={notification}>
                  {notification}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="card card-pad">
        <SectionHeader title="История обучения" description="последние результаты по курсам" />
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
              const course = courses.find((item) => item.id === record.courseId);

              return (
                <tr key={record.courseId}>
                  <td>{course?.title ?? "курс"}</td>
                  <td>{record.percent}%</td>
                  <td>{record.score}</td>
                  <td>
                    <StatusPill tone={record.status === "completed" ? "green" : record.status === "overdue" ? "red" : "blue"}>
                      {record.status}
                    </StatusPill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
