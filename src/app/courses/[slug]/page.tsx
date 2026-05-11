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
  const { currentUser, state, completeLesson, addDiscussionMessage, submitQuizAttempt, addQuizQuestion } = useLms();
  const [message, setMessage] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [optionOne, setOptionOne] = useState("");
  const [optionTwo, setOptionTwo] = useState("");
  const [correctOption, setCorrectOption] = useState<"one" | "two">("one");
  const [explanation, setExplanation] = useState("");
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
  const testLesson = course.lessons.find((lesson) => lesson.type === "test");
  const testQuestions = testLesson
    ? state.quizQuestions.filter((question) => question.courseId === course.id && question.lessonId === testLesson.id)
    : [];
  const latestAttempt = testLesson
    ? state.quizAttempts.filter((attempt) => attempt.userId === currentUser.id && attempt.courseId === course.id && attempt.lessonId === testLesson.id).at(-1)
    : undefined;
  const allAnswered = testQuestions.length > 0 && testQuestions.every((question) => answers[question.id]);

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addDiscussionMessage(courseId, message);
    setMessage("");
  }

  function handleQuizSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!testLesson || !allAnswered) {
      return;
    }

    submitQuizAttempt(courseId, testLesson.id, answers);
  }

  function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!testLesson || questionPrompt.trim().length === 0 || optionOne.trim().length === 0 || optionTwo.trim().length === 0) {
      return;
    }

    const optionOneId = `option-${Date.now()}-1`;
    const optionTwoId = `option-${Date.now()}-2`;

    addQuizQuestion({
      courseId,
      lessonId: testLesson.id,
      prompt: questionPrompt.trim(),
      options: [
        { id: optionOneId, text: optionOne.trim() },
        { id: optionTwoId, text: optionTwo.trim() }
      ],
      correctOptionId: correctOption === "one" ? optionOneId : optionTwoId,
      explanation: explanation.trim() || "ответ проверяется по материалам курса"
    });
    setQuestionPrompt("");
    setOptionOne("");
    setOptionTwo("");
    setCorrectOption("one");
    setExplanation("");
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
            <SectionHeader title="Проверка знаний" description="тест с автоматическим расчетом балла и обновлением прогресса" />
            {testLesson && testQuestions.length > 0 ? (
              <form className="form-grid" onSubmit={handleQuizSubmit}>
                {testQuestions.map((question, index) => (
                  <fieldset className="quiz-card" key={question.id}>
                    <legend>
                      {index + 1}. {question.prompt}
                    </legend>
                    {question.options.map((option) => (
                      <label className="quiz-option" key={option.id}>
                        <input
                          checked={answers[question.id] === option.id}
                          name={question.id}
                          onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                          type="radio"
                        />
                        <span>{option.text}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
                <button className="primary-button" disabled={!allAnswered} type="submit">
                  проверить тест
                </button>
                {latestAttempt ? (
                  <div className="list-item">
                    <div className="row">
                      <strong>результат {latestAttempt.score}%</strong>
                      <StatusPill tone={latestAttempt.passed ? "green" : "red"}>{latestAttempt.passed ? "зачет" : "пересдать"}</StatusPill>
                    </div>
                    <p className="item-text">
                      верных ответов: {latestAttempt.correctAnswers} из {latestAttempt.totalQuestions}
                    </p>
                  </div>
                ) : null}
              </form>
            ) : (
              <EmptyState title="Тест еще не настроен" text="автор курса может добавить вопросы к проверочному уроку" />
            )}
          </div>

          {currentUser.role === "author" && testLesson ? (
            <div className="card card-pad stack">
              <SectionHeader title="Конструктор теста" description="добавление вопроса к проверочному уроку" />
              <form className="form-grid" onSubmit={handleQuestionSubmit}>
                <label>
                  <span className="metric-label">вопрос</span>
                  <textarea className="textarea textarea-compact" onChange={(event) => setQuestionPrompt(event.target.value)} value={questionPrompt} />
                </label>
                <label>
                  <span className="metric-label">вариант 1</span>
                  <input className="input" onChange={(event) => setOptionOne(event.target.value)} value={optionOne} />
                </label>
                <label>
                  <span className="metric-label">вариант 2</span>
                  <input className="input" onChange={(event) => setOptionTwo(event.target.value)} value={optionTwo} />
                </label>
                <label>
                  <span className="metric-label">правильный ответ</span>
                  <select className="select" onChange={(event) => setCorrectOption(event.target.value as "one" | "two")} value={correctOption}>
                    <option value="one">вариант 1</option>
                    <option value="two">вариант 2</option>
                  </select>
                </label>
                <label>
                  <span className="metric-label">пояснение</span>
                  <input className="input" onChange={(event) => setExplanation(event.target.value)} value={explanation} />
                </label>
                <button className="secondary-button" type="submit">
                  добавить вопрос
                </button>
              </form>
            </div>
          ) : null}

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
