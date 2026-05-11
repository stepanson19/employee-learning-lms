"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CourseCard } from "@/components/course";
import { EmptyState, SectionHeader } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";
import { filterCourses } from "@/lib/lms";
import type { CourseStatus } from "@/types/lms";

const statuses: Array<"all" | CourseStatus> = ["all", "published", "review", "draft"];

function statusLabel(status: "all" | CourseStatus) {
  const labels = {
    all: "все статусы",
    draft: "черновики",
    review: "на проверке",
    published: "опубликованы",
    archived: "архив"
  };

  return labels[status];
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const { assignCourse, createCourse, currentUser, state } = useLms();
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCategory, setCourseCategory] = useState("сервис");
  const [courseDeadline, setCourseDeadline] = useState("2026-06-10");
  const [courseXp, setCourseXp] = useState(200);
  const [lessonOne, setLessonOne] = useState("вводный материал");
  const [lessonTwo, setLessonTwo] = useState("практический разбор");
  const [assignmentUserId, setAssignmentUserId] = useState("u-support");
  const [assignmentCourseId, setAssignmentCourseId] = useState("c-sales");
  const [assignmentDueDate, setAssignmentDueDate] = useState("2026-06-01");
  const category = searchParams.get("category") ?? "все";
  const status = (searchParams.get("status") as "all" | CourseStatus | null) ?? "all";
  const categories = ["все", ...Array.from(new Set(state.courses.map((course) => course.category)))];
  const filtered = filterCourses(state.courses, {
    category: category === "все" ? undefined : category,
    status: status === "all" ? undefined : status
  });
  const canManageCourses = currentUser?.role === "author";
  const canAssignCourses = currentUser?.role === "hr" || currentUser?.role === "author";
  const assignableUsers = state.users.filter((user) => user.role === "employee");
  const assignableCourses = state.courses.filter((course) => course.status === "published");

  function handleCreateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (courseTitle.trim().length === 0 || courseDescription.trim().length === 0) {
      return;
    }

    createCourse({
      title: courseTitle,
      description: courseDescription,
      category: courseCategory,
      difficulty: "средний",
      deadline: courseDeadline,
      xpReward: courseXp,
      lessons: [
        { title: lessonOne, type: "longread", durationMinutes: 20 },
        { title: lessonTwo, type: "video", durationMinutes: 25 },
        { title: "итоговый тест", type: "test", durationMinutes: 20 }
      ]
    });
    setCourseTitle("");
    setCourseDescription("");
    setLessonOne("вводный материал");
    setLessonTwo("практический разбор");
  }

  function handleAssignCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    assignCourse({ userId: assignmentUserId, courseId: assignmentCourseId, dueDate: assignmentDueDate });
  }

  return (
    <div className="page page-grid">
      <SectionHeader
        title="Каталог курсов"
        description="модуль управления учебным контентом: курсы, уроки, тесты, статусы публикации и библиотека знаний"
      />

      <section className="card card-pad stack">
        <div className="chip-row" aria-label="Фильтр по категории">
          {categories.map((item) => (
            <Link className={item === category ? "filter-link active" : "filter-link"} href={`/courses?category=${item}&status=${status}`} key={item}>
              {item}
            </Link>
          ))}
        </div>
        <div className="chip-row" aria-label="Фильтр по статусу">
          {statuses.map((item) => (
            <Link className={item === status ? "filter-link active" : "filter-link"} href={`/courses?category=${category}&status=${item}`} key={item}>
              {statusLabel(item)}
            </Link>
          ))}
        </div>
      </section>

      {canManageCourses || canAssignCourses ? (
        <section className="split-grid">
          {canManageCourses ? (
            <div className="card card-pad stack">
              <SectionHeader title="Создание курса" description="быстрое добавление черновика с уроками и тестовым блоком" />
              <form className="form-grid" onSubmit={handleCreateCourse}>
                <label>
                  <span className="metric-label">название курса</span>
                  <input className="input" onChange={(event) => setCourseTitle(event.target.value)} value={courseTitle} />
                </label>
                <label>
                  <span className="metric-label">описание курса</span>
                  <textarea className="textarea textarea-compact" onChange={(event) => setCourseDescription(event.target.value)} value={courseDescription} />
                </label>
                <div className="form-columns">
                  <label>
                    <span className="metric-label">категория курса</span>
                    <input className="input" onChange={(event) => setCourseCategory(event.target.value)} value={courseCategory} />
                  </label>
                  <label>
                    <span className="metric-label">XP за курс</span>
                    <input className="input" min={0} onChange={(event) => setCourseXp(Number(event.target.value))} type="number" value={courseXp} />
                  </label>
                </div>
                <label>
                  <span className="metric-label">срок курса</span>
                  <input className="input" onChange={(event) => setCourseDeadline(event.target.value)} type="date" value={courseDeadline} />
                </label>
                <div className="form-columns">
                  <label>
                    <span className="metric-label">урок 1</span>
                    <input className="input" onChange={(event) => setLessonOne(event.target.value)} value={lessonOne} />
                  </label>
                  <label>
                    <span className="metric-label">урок 2</span>
                    <input className="input" onChange={(event) => setLessonTwo(event.target.value)} value={lessonTwo} />
                  </label>
                </div>
                <button className="primary-button" type="submit">
                  создать курс
                </button>
              </form>
            </div>
          ) : null}

          {canAssignCourses ? (
            <aside className="card card-pad stack">
              <SectionHeader title="Назначение обучения" description="HR/автор назначает опубликованный курс сотруднику" />
              <form className="form-grid" onSubmit={handleAssignCourse}>
                <label>
                  <span className="metric-label">сотрудник</span>
                  <select aria-label="выбор сотрудника" className="select" onChange={(event) => setAssignmentUserId(event.target.value)} value={assignmentUserId}>
                    {assignableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} · {user.department}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="metric-label">курс для назначения</span>
                  <select aria-label="выбор курса" className="select" onChange={(event) => setAssignmentCourseId(event.target.value)} value={assignmentCourseId}>
                    {assignableCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="metric-label">срок назначения</span>
                  <input className="input" onChange={(event) => setAssignmentDueDate(event.target.value)} type="date" value={assignmentDueDate} />
                </label>
                <button className="secondary-button" type="submit">
                  назначить курс
                </button>
              </form>
              <div className="stack">
                <p className="metric-label">последние назначения</p>
                {state.courseAssignments.slice(-4).reverse().map((assignment) => {
                  const user = state.users.find((item) => item.id === assignment.userId);
                  const course = state.courses.find((item) => item.id === assignment.courseId);

                  return (
                    <div className="list-item" key={assignment.id}>
                      <strong>{user?.name ?? "сотрудник"}</strong>
                      <p className="item-text">
                        {course?.title ?? "курс"} · до {assignment.dueDate}
                      </p>
                    </div>
                  );
                })}
              </div>
            </aside>
          ) : null}
        </section>
      ) : null}

      {filtered.length > 0 ? (
        <section className="course-grid">
          {filtered.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </section>
      ) : (
        <EmptyState title="Курсы не найдены" text="поменяйте категорию или статус публикации" />
      )}
    </div>
  );
}
