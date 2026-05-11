import { Send } from "lucide-react";
import { SectionHeader, StatusPill } from "@/components/ui";
import { courses, discussionMessages, feedbackItems, users } from "@/data/lms";

const averageRating = Math.round((feedbackItems.reduce((sum, item) => sum + item.rating, 0) / feedbackItems.length) * 10) / 10;

export default function FeedbackPage() {
  return (
    <div className="page page-grid">
      <SectionHeader
        title="Коммуникации и обратная связь"
        description="обсуждения учебных материалов, комментарии сотрудников, опросы и оценка качества обучения"
      />

      <section className="metric-grid">
        <div className="metric-card">
          <p className="metric-label">сообщения</p>
          <p className="metric-value">{discussionMessages.length}</p>
          <p className="metric-note">в обсуждениях курсов</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">оценка</p>
          <p className="metric-value">{averageRating}</p>
          <p className="metric-note">средняя удовлетворенность</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">отзывы</p>
          <p className="metric-value">{feedbackItems.length}</p>
          <p className="metric-note">после прохождения курсов</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">курсы</p>
          <p className="metric-value">{courses.length}</p>
          <p className="metric-note">доступны для обсуждения</p>
        </div>
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Обсуждения курсов" />
          {discussionMessages.map((message) => {
            const author = users.find((user) => user.id === message.authorId);
            const course = courses.find((item) => item.id === message.courseId);

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
          <form className="form-grid">
            <label>
              <span className="metric-label">курс</span>
              <select className="select" defaultValue="c-onboarding">
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="metric-label">оценка</span>
              <select className="select" defaultValue="5">
                <option value="5">5 — отлично</option>
                <option value="4">4 — хорошо</option>
                <option value="3">3 — нужно улучшить</option>
              </select>
            </label>
            <label>
              <span className="metric-label">комментарий</span>
              <textarea className="textarea" defaultValue="курс помог быстрее разобраться в рабочем процессе" suppressHydrationWarning />
            </label>
            <button className="primary-button" type="button">
              <Send size={16} />
              отправить отзыв
            </button>
          </form>
        </aside>
      </section>

      <section className="card card-pad">
        <SectionHeader title="Последние отзывы" />
        <div className="stack">
          {feedbackItems.map((item) => {
            const course = courses.find((record) => record.id === item.courseId);
            const user = users.find((record) => record.id === item.userId);

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
