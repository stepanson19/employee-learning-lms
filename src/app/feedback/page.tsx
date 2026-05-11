"use client";

import { FormEvent, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { SectionHeader, StatusPill } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";

export default function FeedbackPage() {
  const { currentUser, state, submitFeedback } = useLms();
  const [courseId, setCourseId] = useState("c-onboarding");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("курс помог быстрее разобраться в рабочем процессе");
  const averageRating = useMemo(
    () => Math.round((state.feedbackItems.reduce((sum, item) => sum + item.rating, 0) / Math.max(state.feedbackItems.length, 1)) * 10) / 10,
    [state.feedbackItems]
  );

  if (!currentUser) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitFeedback({ courseId, rating, comment });
    setComment("");
  }

  return (
    <div className="page page-grid">
      <SectionHeader title="Коммуникации и обратная связь" description="обсуждения учебных материалов, комментарии сотрудников, опросы и оценка качества обучения" />

      <section className="metric-grid">
        <div className="metric-card">
          <p className="metric-label">сообщения</p>
          <p className="metric-value">{state.discussionMessages.length}</p>
          <p className="metric-note">в обсуждениях курсов</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">оценка</p>
          <p className="metric-value">{averageRating}</p>
          <p className="metric-note">средняя удовлетворенность</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">отзывы</p>
          <p className="metric-value">{state.feedbackItems.length}</p>
          <p className="metric-note">после прохождения курсов</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">курсы</p>
          <p className="metric-value">{state.courses.length}</p>
          <p className="metric-note">доступны для обсуждения</p>
        </div>
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Обсуждения курсов" />
          {state.discussionMessages.map((message) => {
            const author = state.users.find((user) => user.id === message.authorId);
            const course = state.courses.find((item) => item.id === message.courseId);

            return (
              <div className="list-item" key={message.id}>
                <div className="row">
                  <strong>{author?.name ?? "участник"}</strong>
                  <StatusPill>{course?.title ?? "курс"}</StatusPill>
                </div>
                <p className="item-text">{message.text}</p>
                <p className="metric-note">{message.createdAt}</p>
              </div>
            );
          })}
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Оценка курса" description="форма обратной связи после обучения" />
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span className="metric-label">курс</span>
              <select className="select" onChange={(event) => setCourseId(event.target.value)} value={courseId}>
                {state.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="metric-label">оценка</span>
              <select className="select" onChange={(event) => setRating(Number(event.target.value))} value={rating}>
                <option value="5">5 — отлично</option>
                <option value="4">4 — хорошо</option>
                <option value="3">3 — нужно улучшить</option>
              </select>
            </label>
            <label>
              <span className="metric-label">комментарий</span>
              <textarea className="textarea" onChange={(event) => setComment(event.target.value)} value={comment} />
            </label>
            <button className="primary-button" type="submit">
              <Send size={16} />
              отправить отзыв
            </button>
          </form>
        </aside>
      </section>

      <section className="card card-pad">
        <SectionHeader title="Последние отзывы" />
        <div className="stack">
          {state.feedbackItems.map((item) => {
            const course = state.courses.find((record) => record.id === item.courseId);
            const user = state.users.find((record) => record.id === item.userId);

            return (
              <div className="list-item" key={item.id}>
                <div className="row">
                  <div>
                    <strong>{course?.title ?? "курс"}</strong>
                    <p className="item-text">{user?.name ?? "сотрудник"}</p>
                  </div>
                  <StatusPill tone={item.rating >= 5 ? "green" : "blue"}>{item.rating}/5</StatusPill>
                </div>
                <p className="item-text">{item.comment}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
