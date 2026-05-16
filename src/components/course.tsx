import Link from "next/link";
import { ArrowRight, Check, Clock, FileText, ListChecks, MessageSquareText, PlayCircle } from "lucide-react";
import type { Course, DiscussionMessage, Lesson, User } from "@/types/lms";
import { getCourseProgress } from "@/lib/lms";
import { ProgressBar, StatusPill } from "@/components/ui";

const statusLabels = {
  draft: "черновик",
  review: "на проверке",
  published: "опубликован",
  archived: "архив"
} as const;

const lessonIcons = {
  video: PlayCircle,
  pdf: FileText,
  longread: FileText,
  test: ListChecks
} as const;

export function CourseCard({ course }: Readonly<{ course: Course }>) {
  const progress = getCourseProgress(course.lessons);
  const completedLessons = course.lessons.filter((lesson) => lesson.completed).length;

  return (
    <Link className="course-card" href={`/courses/${course.slug}`}>
      <div className="stack">
        <div className="row">
          <StatusPill tone={course.status === "published" ? "green" : course.status === "review" ? "orange" : "blue"}>
            {statusLabels[course.status]}
          </StatusPill>
          <span className="muted">{course.xpReward} XP</span>
        </div>
        <div>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
        </div>
      </div>
      <div className="stack">
        <div className="course-meta-row">
          <span>{completedLessons}/{course.lessons.length} уроков</span>
          <span>до {course.deadline}</span>
        </div>
        <div className="chip-row">
          <StatusPill>{course.category}</StatusPill>
          <StatusPill tone="violet">{course.difficulty}</StatusPill>
          <StatusPill tone="orange">{course.durationMinutes} мин</StatusPill>
        </div>
        <ProgressBar label="прогресс курса" value={progress} />
        <span className="course-card-action">
          открыть курс
          <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

export function LessonList({ lessons, onComplete }: Readonly<{ lessons: Lesson[]; onComplete?: (lessonId: string) => void }>) {
  return (
    <div className="lesson-list">
      {lessons.map((lesson, index) => {
        const Icon = lessonIcons[lesson.type];
        const itemClassName = ["lesson-item", lesson.completed ? "done" : "", !lesson.completed && onComplete ? "actionable" : ""].filter(Boolean).join(" ");

        return (
          <div className={itemClassName} key={lesson.id}>
            <span className={lesson.completed ? "lesson-state done" : "lesson-state"}>{lesson.completed ? <Check size={16} /> : index + 1}</span>
            <div>
              <p className="item-title">{lesson.title}</p>
              <p className="item-text">
                <Icon size={15} /> {lesson.type} · {lesson.durationMinutes} мин
              </p>
            </div>
            {lesson.completed ? (
              <StatusPill tone="green">готово</StatusPill>
            ) : lesson.type === "test" ? (
              <StatusPill tone="violet">через тест</StatusPill>
            ) : onComplete ? (
              <button className="secondary-button compact" onClick={() => onComplete(lesson.id)} type="button">
                отметить
              </button>
            ) : (
              <StatusPill>в плане</StatusPill>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DiscussionPreview({
  messages,
  users
}: Readonly<{ messages: DiscussionMessage[]; users: User[] }>) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <MessageSquareText />
        <p>обсуждений по курсу пока нет</p>
      </div>
    );
  }

  return (
    <div className="stack">
      {messages.slice(0, 3).map((message) => {
        const author = users.find((user) => user.id === message.authorId);

        return (
          <div className="card card-pad" key={message.id}>
            <div className="row">
              <strong>{author?.name ?? "участник"}</strong>
              <span className="muted">{message.createdAt}</span>
            </div>
            <p className="item-text">{message.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export function DeadlineNote({ deadline }: Readonly<{ deadline: string }>) {
  return (
    <span className="pill pill-orange">
      <Clock size={14} />
      дедлайн {deadline}
    </span>
  );
}
