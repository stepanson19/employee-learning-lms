import type {
  AnalyticsFilters,
  AnalyticsRow,
  AnalyticsSummary,
  Badge,
  Course,
  CourseFilters,
  Lesson,
  LevelInfo,
  ProgressRecord,
  User
} from "@/types/lms";

const levels = [
  { label: "новичок", minXp: 0 },
  { label: "практик", minXp: 300 },
  { label: "специалист", minXp: 700 },
  { label: "наставник", minXp: 1200 },
  { label: "эксперт", minXp: 1800 }
] as const;

export function getLevelByXp(xp: number): LevelInfo {
  const currentIndex = levels.reduce((levelIndex, level, index) => (xp >= level.minXp ? index : levelIndex), 0);
  const current = levels[currentIndex];
  const next = levels[currentIndex + 1] ?? null;
  const progressToNext = next ? Math.min(100, Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)) : 100;

  return {
    label: current.label,
    minXp: current.minXp,
    nextLabel: next?.label ?? null,
    nextXp: next?.minXp ?? null,
    progressToNext
  };
}

export function getCourseProgress(lessons: Lesson[]): number {
  if (lessons.length === 0) {
    return 0;
  }

  const completed = lessons.filter((lesson) => lesson.completed).length;
  return Math.round((completed / lessons.length) * 100);
}

export function getEarnedBadges(user: User, progress: ProgressRecord[], badges: Badge[]): Badge[] {
  const userProgress = progress.filter((record) => record.userId === user.id);

  return badges.filter((badge) => {
    switch (badge.rule) {
      case "first-completion":
        return userProgress.some((record) => record.status === "completed") || user.completedCourses >= 1;
      case "high-score":
        return userProgress.some((record) => record.score >= 95);
      case "level-specialist":
        return user.xp >= 700;
      case "three-completions":
        return user.completedCourses >= 3;
      case "weekly-200":
        return user.weeklyXp >= 200;
      case "all-onboarding":
        return userProgress.some((record) => record.courseId === "c-onboarding" && record.percent === 100);
      case "author":
        return user.role === "author";
      case "hr-mentor":
        return user.role === "hr";
      default:
        return false;
    }
  });
}

export function getLeaderboard(users: User[]): User[] {
  return [...users].sort((left, right) => right.xp - left.xp || left.name.localeCompare(right.name, "ru"));
}

export function getAnalyticsSummary(users: User[], courses: Course[], progress: ProgressRecord[]): AnalyticsSummary {
  const completedRecords = progress.filter((record) => record.status === "completed" || record.percent === 100);
  const totalScore = progress.reduce((sum, record) => sum + record.score, 0);
  const totalTime = progress.reduce((sum, record) => sum + record.timeSpentMinutes, 0);
  const activeLearners = new Set(progress.map((record) => record.userId)).size;
  const publishedCourses = courses.filter((course) => course.status === "published").length;
  const engagementBase = users.length * Math.max(publishedCourses, 1);

  return {
    completionRate: Math.round((completedRecords.length / Math.max(progress.length, 1)) * 100),
    averageScore: Math.round(totalScore / Math.max(progress.length, 1)),
    activeLearners,
    totalTimeHours: Math.round((totalTime / 60) * 10) / 10,
    engagementRate: Math.round((progress.length / engagementBase) * 100)
  };
}

export function getAnalyticsRows(users: User[], courses: Course[], progress: ProgressRecord[], filters: AnalyticsFilters = {}): AnalyticsRow[] {
  return progress
    .map((record) => {
      const user = users.find((item) => item.id === record.userId);
      const course = courses.find((item) => item.id === record.courseId);

      return user && course ? { user, course, record } : null;
    })
    .filter((row): row is AnalyticsRow => Boolean(row))
    .filter((row) => {
      const matchesDepartment = filters.department ? row.user.department === filters.department : true;
      const matchesCourse = filters.courseId ? row.course.id === filters.courseId : true;

      return matchesDepartment && matchesCourse;
    });
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportAnalyticsCsv(rows: AnalyticsRow[]): string {
  const header = ["employee", "department", "course", "progress", "score", "status"];
  const body = rows.map((row) =>
    [row.user.name, row.user.department, row.course.title, row.record.percent, row.record.score, row.record.status].map(csvCell).join(",")
  );

  return [header.join(","), ...body].join("\n");
}

export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  const normalizedQuery = filters.query?.trim().toLocaleLowerCase("ru") ?? "";

  return courses.filter((course) => {
    const matchesCategory = filters.category ? course.category === filters.category : true;
    const matchesStatus = filters.status ? course.status === filters.status : true;
    const matchesDifficulty = filters.difficulty ? course.difficulty === filters.difficulty : true;
    const matchesQuery = normalizedQuery
      ? `${course.title} ${course.description} ${course.category}`.toLocaleLowerCase("ru").includes(normalizedQuery)
      : true;

    return matchesCategory && matchesStatus && matchesDifficulty && matchesQuery;
  });
}

export function getCourseBySlug(courses: Course[], slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function getUserById(users: User[], userId: string): User | undefined {
  return users.find((user) => user.id === userId);
}

export function getCourseProgressRecord(progress: ProgressRecord[], courseId: string, userId: string): ProgressRecord | undefined {
  return progress.find((record) => record.courseId === courseId && record.userId === userId);
}
