"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn } from "lucide-react";
import { demoAccounts, users } from "@/data/lms";
import { useLms } from "@/components/LmsProvider";
import { StatusPill } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { hydrated, session, login, resetDemo } = useLms();
  const [email, setEmail] = useState("danil@learnhub.local");
  const [passcode, setPasscode] = useState("employee2026");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && session) {
      router.replace("/");
    }
  }, [hydrated, router, session]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = login(email, passcode);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
  }

  return (
    <main className="auth-screen">
      <section className="auth-card auth-card-wide">
        <div className="auth-intro">
          <span className="brand-mark">LH</span>
          <div>
            <p className="metric-label">LearnHub LMS</p>
            <h1>Вход в платформу обучения</h1>
            <p className="section-description">
              выберите роль и войдите в рабочий аккаунт, чтобы управлять курсами, прогрессом, наградами и отчетностью
            </p>
          </div>
        </div>

        <div className="login-grid">
          <form className="card card-pad form-grid" onSubmit={handleSubmit}>
            <label>
              <span className="metric-label">почта</span>
              <input className="input" onChange={(event) => setEmail(event.target.value)} value={email} />
            </label>
            <label>
              <span className="metric-label">код доступа</span>
              <input className="input" onChange={(event) => setPasscode(event.target.value)} type="password" value={passcode} />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            <button className="primary-button" type="submit">
              <LogIn size={16} />
              войти
            </button>
            <button className="secondary-button" onClick={resetDemo} type="button">
              сбросить демо-данные
            </button>
          </form>

          <div className="stack">
            {demoAccounts.map((account) => {
              const user = users.find((item) => item.id === account.userId);

              return (
                <button
                  className="account-card"
                  key={account.userId}
                  onClick={() => {
                    setEmail(account.email);
                    setPasscode(account.passcode);
                    setError("");
                  }}
                  type="button"
                >
                  <span className="avatar avatar-sm">{user?.avatarInitials}</span>
                  <span>
                    <strong>{user?.name}</strong>
                    <span className="item-text">{account.email}</span>
                  </span>
                  <StatusPill tone={user?.role === "employee" ? "blue" : user?.role === "hr" ? "green" : "violet"}>{account.label}</StatusPill>
                </button>
              );
            })}
            <div className="list-item">
              <LockKeyhole size={18} />
              <p className="item-text">
                данные сохраняются в браузере: прогресс, отзывы, сообщения и заявки на награды не сбрасываются после обновления страницы
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
