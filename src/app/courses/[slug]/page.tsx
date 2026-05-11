"use client";

import { FormEvent, useState } from "react";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";
import { DeadlineNote, DiscussionPreview, LessonList } from "@/components/course";
import { EmptyState, MetricCard, ProgressBar, SectionHeader, StatusPill } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";
import { getCourseBySlug, getCourseProgress } from "@/lib/lms";

const statusLabels = {
  draft: "черновик",
  review: "на проверке",
  published: "опубликован",
  archived: "архив"
} as const;

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const { currentUser, state, completeLesson, addDiscussionMessage } = useLms();
  const [message, setMessage] = useState("");
  const course = getCourseBySlug(state.courses, params.slug);

  if (!course || !currentUser) {
    return (
      <div className="page">
        <EmptyState title="Курс не найден" text="вернитесь в каталог и выберите доступный курс" />
      </div>
    );
  }

  const courseId = course.id;
  const progress = getCourseProgress(course.lessons);
  const courseMessages = state.discussionMessages.filter((item) => item.courseId === course.id);
  const courseProgress = state.progressRecords.filter((record) => record.courseId === course.id);
  const averageScore = Math.round(courseProgress.reduce((sum, record) => sum + record.score, 0) / Math.max(courseProgress.length, 1));

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addDiscussionMessage(courseId, message);
    setMessage("");
  }

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
        <MetricCard label="средний балл" value={averageScore || "—"} note="по прохождениям" />
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Учебный маршрут" description="уроки, материалы и проверочные задания" />
          <ProgressBar label="общий прогресс" value={progress} />
          <LessonList lessons={course.lessons} onComplete={(lessonId) => completeLesson(course.id, lessonId)} />
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
            <form className="form-grid" onSubmit={handleMessageSubmit}>
              <textarea
                className="textarea textarea-compact"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="написать сообщение"
                value={message}
              />
              <button className="primary-button" type="submit">
                <Send size={16} />
                отправить
              </button>
            </form>
            <DiscussionPreview messages={courseMessages} users={state.users} />
          </div>
        </aside>
      </section>
    </div>
  );
}
