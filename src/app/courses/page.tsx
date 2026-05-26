"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { CourseCard } from "@/components/course";
import { EmptyState, SectionHeader } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";
import { filterCourses } from "@/lib/lms";
import type { CourseStatus } from "@/types/lms";

const statuses: Array<"all" | CourseStatus> = ["all", "published", "review", "draft"];
const assignmentDeadlineOptions = [
  { value: "7", label: "1 неделя", days: 7 },
  { value: "14", label: "2 недели", days: 14 },
  { value: "30", label: "1 месяц", days: 30 },
  { value: "60", label: "2 месяца", days: 60 },
  { value: "90", label: "3 месяца", days: 90 },
  { value: "custom", label: "своя дата", days: null }
] as const;

type AssignmentDeadlineOption = (typeof assignmentDeadlineOptions)[number]["value"];

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDaysFromToday(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return formatDateInputValue(date);
}

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
  const [assignmentDeadlineOption, setAssignmentDeadlineOption] = useState<AssignmentDeadlineOption>("14");
  const [customAssignmentDueDate, setCustomAssignmentDueDate] = useState(() => addDaysFromToday(14));
  const [query, setQuery] = useState("");
  const category = searchParams.get("category") ?? "все";
  const status = (searchParams.get("status") as "all" | CourseStatus | null) ?? "all";
  const categories = ["все", ...Array.from(new Set(state.courses.map((course) => course.category)))];
  const filtered = filterCourses(state.courses, {
    category: category === "все" ? undefined : category,
    status: status === "all" ? undefined : status
  });
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  const visibleCourses =
    normalizedQuery.length === 0
      ? filtered
      : filtered.filter((course) =>
          [course.title, course.description, course.category, course.difficulty].some((value) => value.toLocaleLowerCase("ru").includes(normalizedQuery))
        );
  const publishedCount = visibleCourses.filter((course) => course.status === "published").length;
  const draftCount = visibleCourses.filter((course) => course.status === "draft").length;
  const totalMinutes = visibleCourses.reduce((sum, course) => sum + course.durationMinutes, 0);
  const canManageCourses = currentUser?.role === "author";
  const canAssignCourses = currentUser?.role === "hr" || currentUser?.role === "author";
  const assignableUsers = state.users.filter((user) => user.role === "employee");
  const assignableCourses = state.courses.filter((course) => course.status === "published");
  const selectedDeadlineOption = assignmentDeadlineOptions.find((option) => option.value === assignmentDeadlineOption) ?? assignmentDeadlineOptions[1];
  const assignmentDueDate = selectedDeadlineOption.days === null ? customAssignmentDueDate : addDaysFromToday(selectedDeadlineOption.days);

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
        <div className="course-filter-head">
          <label className="search-field">
            <Search aria-hidden="true" size={17} />
            <span className="visually-hidden">поиск курса</span>
            <input
              aria-label="поиск курса"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="найти курс по названию, описанию или категории"
              value={query}
            />
          </label>
          <div className="course-result-count" aria-live="polite">
            <strong>{visibleCourses.length}</strong>
            <span>курсов найдено</span>
          </div>
        </div>
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
        <div className="course-summary-row">
          <span>
            <strong>{publishedCount}</strong> опубликованы
          </span>
          <span>
            <strong>{draftCount}</strong> черновики
          </span>
          <span>
            <strong>{totalMinutes}</strong> минут обучения
          </span>
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
                <div className="form-columns">
                  <label>
                    <span className="metric-label">срок прохождения</span>
                    <select
                      aria-label="срок прохождения"
                      className="select"
                      onChange={(event) => setAssignmentDeadlineOption(event.target.value as AssignmentDeadlineOption)}
                      value={assignmentDeadlineOption}
                    >
                      {assignmentDeadlineOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="metric-label">дедлайн</span>
                    <input
                      aria-label="дата дедлайна"
                      className="input"
                      disabled={assignmentDeadlineOption !== "custom"}
                      onChange={(event) => setCustomAssignmentDueDate(event.target.value)}
                      type="date"
                      value={assignmentDueDate}
                    />
                  </label>
                </div>
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

      {visibleCourses.length > 0 ? (
        <section className="course-grid">
          {visibleCourses.map((course) => (
            <CourseCard course={course} key={course.id} />
          ))}
        </section>
      ) : (
        <EmptyState title="Курсы не найдены" text="измените поиск, категорию или статус публикации" />
      )}
    </div>
  );
}
