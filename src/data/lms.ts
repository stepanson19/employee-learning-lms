import type { Badge, Course, DemoAccount, DiscussionMessage, Feedback, ProgressRecord, RewardItem, User } from "@/types/lms";

export const users: User[] = [
  {
    id: "u-employee",
    name: "Данил Мятный",
    role: "employee",
    department: "Продажи",
    position: "Менеджер по работе с клиентами",
    avatarInitials: "ДМ",
    xp: 760,
    weeklyXp: 245,
    completedCourses: 2,
    activeCourses: 3,
    skills: ["адаптация", "продажи", "клиентский сервис"],
    notifications: ["дедлайн по курсу продаж через 2 дня", "получен бейдж «Быстрый старт»"]
  },
  {
    id: "u-hr",
    name: "Марина Орлова",
    role: "hr",
    department: "HR",
    position: "HR-специалист",
    avatarInitials: "МО",
    xp: 1240,
    weeklyXp: 180,
    completedCourses: 4,
    activeCourses: 2,
    skills: ["аналитика", "адаптация", "оценка персонала"],
    notifications: ["3 сотрудника не уложились в срок", "новый отчет по вовлеченности готов"]
  },
  {
    id: "u-author",
    name: "Игорь Соколов",
    role: "author",
    department: "Обучение",
    position: "Методист",
    avatarInitials: "ИС",
    xp: 980,
    weeklyXp: 210,
    completedCourses: 3,
    activeCourses: 1,
    skills: ["контент", "тесты", "методология"],
    notifications: ["курс по продукту ожидает публикации", "получена обратная связь по уроку"]
  },
  {
    id: "u-support",
    name: "Алена Сергеева",
    role: "employee",
    department: "Поддержка",
    position: "Специалист поддержки",
    avatarInitials: "АС",
    xp: 430,
    weeklyXp: 95,
    completedCourses: 1,
    activeCourses: 2,
    skills: ["поддержка", "регламенты", "коммуникации"],
    notifications: ["назначен курс по безопасности", "новый комментарий в обсуждении"]
  }
];

export const demoAccounts: DemoAccount[] = [
  { userId: "u-employee", email: "danil@learnhub.local", passcode: "employee2026", label: "Сотрудник" },
  { userId: "u-hr", email: "hr@learnhub.local", passcode: "hr2026", label: "HR" },
  { userId: "u-author", email: "author@learnhub.local", passcode: "author2026", label: "Автор" }
];

export const courses: Course[] = [
  {
    id: "c-onboarding",
    slug: "onboarding",
    title: "Быстрый старт сотрудника",
    description: "Вводный курс по процессам компании, корпоративным правилам и первым рабочим сценариям.",
    category: "адаптация",
    difficulty: "базовый",
    status: "published",
    authorId: "u-author",
    durationMinutes: 95,
    deadline: "2026-05-18",
    xpReward: 180,
    lessons: [
      { id: "l-on-1", title: "структура компании", type: "longread", durationMinutes: 15, completed: true },
      { id: "l-on-2", title: "рабочие регламенты", type: "pdf", durationMinutes: 20, completed: true },
      { id: "l-on-3", title: "первые задачи", type: "video", durationMinutes: 35, completed: true },
      { id: "l-on-4", title: "итоговый тест", type: "test", durationMinutes: 25, completed: false }
    ]
  },
  {
    id: "c-sales",
    slug: "sales",
    title: "Продажи без потери качества",
    description: "Практические сценарии общения с клиентами, работа с возражениями и контроль результата.",
    category: "продажи",
    difficulty: "средний",
    status: "published",
    authorId: "u-author",
    durationMinutes: 130,
    deadline: "2026-05-21",
    xpReward: 260,
    lessons: [
      { id: "l-sa-1", title: "воронка продаж", type: "video", durationMinutes: 30, completed: true },
      { id: "l-sa-2", title: "работа с возражениями", type: "longread", durationMinutes: 25, completed: true },
      { id: "l-sa-3", title: "скрипты и кейсы", type: "pdf", durationMinutes: 25, completed: false },
      { id: "l-sa-4", title: "проверочный тест", type: "test", durationMinutes: 20, completed: false }
    ]
  },
  {
    id: "c-security",
    slug: "security",
    title: "Информационная безопасность",
    description: "Базовые правила защиты корпоративных данных и безопасной работы с сервисами.",
    category: "безопасность",
    difficulty: "базовый",
    status: "published",
    authorId: "u-author",
    durationMinutes: 80,
    deadline: "2026-05-25",
    xpReward: 160,
    lessons: [
      { id: "l-se-1", title: "пароли и доступы", type: "video", durationMinutes: 20, completed: true },
      { id: "l-se-2", title: "фишинг и письма", type: "longread", durationMinutes: 25, completed: false },
      { id: "l-se-3", title: "тест по безопасности", type: "test", durationMinutes: 20, completed: false }
    ]
  },
  {
    id: "c-product",
    slug: "product",
    title: "Продуктовая база знаний",
    description: "Материалы по продуктовой линейке, частым вопросам и внутренним инструкциям.",
    category: "продукт",
    difficulty: "средний",
    status: "review",
    authorId: "u-author",
    durationMinutes: 110,
    deadline: "2026-05-28",
    xpReward: 220,
    lessons: [
      { id: "l-pr-1", title: "линейка продуктов", type: "video", durationMinutes: 35, completed: false },
      { id: "l-pr-2", title: "частые вопросы клиентов", type: "pdf", durationMinutes: 25, completed: false },
      { id: "l-pr-3", title: "симуляция консультации", type: "test", durationMinutes: 30, completed: false }
    ]
  },
  {
    id: "c-management",
    slug: "management",
    title: "Основы управления командой",
    description: "Курс для руководителей отделов: цели, обратная связь, обучение и контроль прогресса.",
    category: "менеджмент",
    difficulty: "продвинутый",
    status: "draft",
    authorId: "u-author",
    durationMinutes: 150,
    deadline: "2026-06-03",
    xpReward: 320,
    lessons: [
      { id: "l-ma-1", title: "постановка целей", type: "longread", durationMinutes: 35, completed: false },
      { id: "l-ma-2", title: "one-to-one встречи", type: "video", durationMinutes: 40, completed: false },
      { id: "l-ma-3", title: "оценка развития", type: "test", durationMinutes: 30, completed: false }
    ]
  }
];

export const badges: Badge[] = [
  { id: "fast-start", title: "Быстрый старт", description: "завершен первый курс", icon: "rocket", tone: "green", rule: "first-completion" },
  { id: "level-up", title: "Специалист", description: "набрано 700 XP", icon: "sparkles", tone: "violet", rule: "level-specialist" },
  { id: "perfect-score", title: "Без ошибок", description: "результат теста от 95 баллов", icon: "target", tone: "blue", rule: "high-score" },
  { id: "steady-learner", title: "Стабильный рост", description: "три завершенных курса", icon: "trending", tone: "orange", rule: "three-completions" },
  { id: "weekly-push", title: "Рывок недели", description: "200 XP за неделю", icon: "zap", tone: "red", rule: "weekly-200" },
  { id: "onboarding-master", title: "Адаптация пройдена", description: "курс адаптации закрыт полностью", icon: "check", tone: "green", rule: "all-onboarding" },
  { id: "content-maker", title: "Автор знаний", description: "роль автора курса", icon: "book", tone: "blue", rule: "author" },
  { id: "hr-mentor", title: "Наставник HR", description: "роль HR-специалиста", icon: "users", tone: "violet", rule: "hr-mentor" }
];

export const progressRecords: ProgressRecord[] = [
  { userId: "u-employee", courseId: "c-onboarding", completedLessons: 3, totalLessons: 4, percent: 75, score: 92, timeSpentMinutes: 74, status: "active", updatedAt: "2026-05-10" },
  { userId: "u-employee", courseId: "c-sales", completedLessons: 2, totalLessons: 4, percent: 50, score: 88, timeSpentMinutes: 68, status: "active", updatedAt: "2026-05-09" },
  { userId: "u-employee", courseId: "c-security", completedLessons: 3, totalLessons: 3, percent: 100, score: 96, timeSpentMinutes: 80, status: "completed", updatedAt: "2026-05-04" },
  { userId: "u-hr", courseId: "c-management", completedLessons: 3, totalLessons: 3, percent: 100, score: 91, timeSpentMinutes: 146, status: "completed", updatedAt: "2026-05-08" },
  { userId: "u-author", courseId: "c-product", completedLessons: 2, totalLessons: 3, percent: 67, score: 84, timeSpentMinutes: 73, status: "active", updatedAt: "2026-05-07" },
  { userId: "u-support", courseId: "c-security", completedLessons: 1, totalLessons: 3, percent: 33, score: 76, timeSpentMinutes: 28, status: "overdue", updatedAt: "2026-05-06" }
];

export const discussionMessages: DiscussionMessage[] = [
  { id: "d-1", courseId: "c-onboarding", authorId: "u-employee", text: "после блока про регламенты стало понятнее, где искать инструкции.", createdAt: "2026-05-10" },
  { id: "d-2", courseId: "c-sales", authorId: "u-hr", text: "добавьте пример для сложного клиента из b2b-сегмента.", createdAt: "2026-05-09" },
  { id: "d-3", courseId: "c-security", authorId: "u-support", text: "нужна короткая памятка по фишинговым письмам.", createdAt: "2026-05-08" },
  { id: "d-4", courseId: "c-product", authorId: "u-author", text: "обновил урок с частыми вопросами, проверьте формулировки.", createdAt: "2026-05-07" },
  { id: "d-5", courseId: "c-onboarding", authorId: "u-hr", text: "для новых сотрудников этот курс будет обязательным с понедельника.", createdAt: "2026-05-06" }
];

export const feedbackItems: Feedback[] = [
  { id: "f-1", courseId: "c-onboarding", userId: "u-employee", rating: 5, comment: "удобная структура и понятные первые шаги", createdAt: "2026-05-10" },
  { id: "f-2", courseId: "c-sales", userId: "u-employee", rating: 4, comment: "хочется больше практических диалогов", createdAt: "2026-05-09" },
  { id: "f-3", courseId: "c-security", userId: "u-support", rating: 4, comment: "полезно, но нужен чек-лист", createdAt: "2026-05-08" },
  { id: "f-4", courseId: "c-management", userId: "u-hr", rating: 5, comment: "подходит для руководителей отделов", createdAt: "2026-05-07" }
];

export const rewardItems: RewardItem[] = [
  {
    id: "company-merch",
    title: "Фирменный мерч",
    description: "заявка на набор с корпоративными материалами",
    costXp: 450,
    availableFor: ["employee", "hr", "author"]
  },
  {
    id: "extra-training",
    title: "Дополнительное обучение",
    description: "сертификат на внешний курс или интенсив",
    costXp: 700,
    availableFor: ["employee", "hr", "author"]
  },
  {
    id: "focus-day",
    title: "День без встреч",
    description: "согласование свободного дня для глубокого обучения",
    costXp: 900,
    availableFor: ["employee", "hr"]
  }
];
