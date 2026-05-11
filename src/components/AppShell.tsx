"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Award, BarChart3, BookOpen, LogOut, LayoutDashboard, MessageSquareText, ShieldCheck, UserRound } from "lucide-react";
import { useLms } from "@/components/LmsProvider";
import { canAccessRoute } from "@/lib/auth";
import { StatusPill } from "@/components/ui";

const navItems = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/profile", label: "Мой кабинет", icon: UserRound },
  { href: "/achievements", label: "Достижения", icon: Award },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/feedback", label: "Обратная связь", icon: MessageSquareText }
];

const roleLabels = {
  employee: "сотрудник",
  hr: "HR",
  author: "автор"
} as const;

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const { hydrated, session, currentUser, logout } = useLms();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!hydrated) {
    return (
      <main className="auth-screen">
        <div className="auth-card">
          <p className="metric-label">LearnHub</p>
          <h1>Загрузка платформы</h1>
        </div>
      </main>
    );
  }

  if (!session || !currentUser) {
    return (
      <main className="auth-screen">
        <div className="auth-card stack">
          <span className="brand-mark">LH</span>
          <div>
            <p className="metric-label">доступ к LMS</p>
            <h1>Требуется вход</h1>
            <p className="section-description">войдите в аккаунт сотрудника, HR или автора курса, чтобы продолжить работу с платформой</p>
          </div>
          <Link className="primary-button" href="/login">
            открыть вход
          </Link>
        </div>
      </main>
    );
  }

  if (!canAccessRoute(session.role, pathname)) {
    return (
      <main className="auth-screen">
        <div className="auth-card stack">
          <ShieldCheck size={30} />
          <div>
            <p className="metric-label">ограничение роли</p>
            <h1>Раздел доступен HR и автору</h1>
            <p className="section-description">для просмотра аналитики войдите под аккаунтом HR или автора учебных материалов</p>
          </div>
          <Link className="primary-button" href="/">
            на дашборд
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell" data-role={session.role}>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">LH</span>
          <span>
            <p className="brand-title">LearnHub</p>
            <p className="brand-subtitle">корпоративная LMS</p>
          </span>
        </Link>

        <nav className="nav-list" aria-label="Основная навигация">
          {navItems.filter((item) => canAccessRoute(session.role, item.href)).map((item) => {
            const Icon = item.icon;
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link className={active ? "nav-link active" : "nav-link"} href={item.href} key={item.href}>
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="shell-main">
        <header className="topbar">
          <div>
            <p className="topbar-title">Платформа удаленного обучения сотрудников</p>
            <p className="topbar-meta">
              {currentUser.name} · {currentUser.department} · {roleLabels[session.role]}
            </p>
          </div>

          <div className="account-menu" aria-label="Аккаунт">
            <StatusPill tone={session.role === "employee" ? "blue" : session.role === "hr" ? "green" : "violet"}>{roleLabels[session.role]}</StatusPill>
            <span className="avatar avatar-sm">{currentUser.avatarInitials}</span>
            <button className="icon-button" onClick={logout} title="Выйти" type="button">
              <LogOut size={17} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
