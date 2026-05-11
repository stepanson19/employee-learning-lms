"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CourseCard } from "@/components/course";
import { EmptyState, SectionHeader } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";
import { filterCourses } from "@/lib/lms";
import type { CourseStatus } from "@/types/lms";

const categories = ["все", "адаптация", "продажи", "безопасность", "продукт", "менеджмент"];
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
  const { state } = useLms();
  const category = searchParams.get("category") ?? "все";
  const status = (searchParams.get("status") as "all" | CourseStatus | null) ?? "all";
  const filtered = filterCourses(state.courses, {
    category: category === "все" ? undefined : category,
    status: status === "all" ? undefined : status
  });

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
