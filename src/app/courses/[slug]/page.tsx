import { notFound } from "next/navigation";
import { DeadlineNote, DiscussionPreview, LessonList } from "@/components/course";
import { MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { courses, discussionMessages, progressRecords, users } from "@/data/lms";
import { getCourseBySlug, getCourseProgress } from "@/lib/lms";

const statusLabels = {
  draft: "черновик",
  review: "на проверке",
  published: "опубликован",
  archived: "архив"
} as const;

export default async function CourseDetailPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;
  const course = getCourseBySlug(courses, slug);

  if (!course) {
    notFound();
  }

  const progress = getCourseProgress(course.lessons);
  const courseMessages = discussionMessages.filter((message) => message.courseId === course.id);
  const courseProgress = progressRecords.filter((record) => record.courseId === course.id);
  const averageScore = Math.round(courseProgress.reduce((sum, record) => sum + record.score, 0) / Math.max(courseProgress.length, 1));

  return (
    <div className="page page-grid">
      <SectionHeader
        title={course.title}
        description={course.description}
        action={
          <div className="chip-row">
            <StatusPill tone={course.status === "published" ? "green" : "orange"}>{statusLabels[course.status]}</StatusPill>
            <DeadlineNote deadline={course.deadline} />
          </div>
        }
      />

      <section className="metric-grid" aria-label="Показатели курса">
        <MetricCard label="прогресс" value={`${progress}%`} note="по урокам курса" />
        <MetricCard label="награда" value={`${course.xpReward} XP`} note="после завершения" />
        <MetricCard label="уроки" value={course.lessons.length} note={`${course.durationMinutes} минут`} />
        <MetricCard label="средний балл" value={averageScore || "—"} note="по демо-прохождениям" />
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Учебный маршрут" description="уроки, материалы и проверочные задания" />
          <ProgressBar label="общий прогресс" value={progress} />
          <LessonList lessons={course.lessons} />
        </div>

        <aside className="stack">
          <div className="card card-pad stack">
            <SectionHeader title="Проверка знаний" description="короткий контроль по ключевым материалам курса" />
            <div className="card card-pad">
              <p className="item-title">Вопрос</p>
              <p className="item-text">какой следующий шаг после изучения обязательного материала?</p>
              <div className="chip-row" style={{ marginTop: 12 }}>
                <StatusPill tone="green">пройти тест</StatusPill>
                <StatusPill>получить XP</StatusPill>
                <StatusPill tone="violet">обновить прогресс</StatusPill>
              </div>
            </div>
          </div>

          <div className="card card-pad stack">
            <SectionHeader title="Обсуждение курса" description="вопросы сотрудников и комментарии HR/авторов" />
            <DiscussionPreview messages={courseMessages} users={users} />
          </div>
        </aside>
      </section>
    </div>
  );
}
