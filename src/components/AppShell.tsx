"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Award, BarChart3, BookOpen, LayoutDashboard, MessageSquareText, UserRound } from "lucide-react";
import type { Role } from "@/types/lms";

const navItems = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/profile", label: "Мой кабинет", icon: UserRound },
  { href: "/achievements", label: "Достижения", icon: Award },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/feedback", label: "Обратная связь", icon: MessageSquareText }
];

const roles: Array<{ id: Role; label: string; description: string }> = [
  { id: "employee", label: "Сотрудник", description: "видит личный план и прогресс" },
  { id: "hr", label: "HR", description: "контролирует обучение отдела" },
  { id: "author", label: "Автор", description: "управляет курсами и тестами" }
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>("employee");
  const activeRole = useMemo(() => roles.find((item) => item.id === role) ?? roles[0], [role]);

  return (
    <div className="app-shell" data-role={role}>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">LH</span>
          <span>
            <p className="brand-title">LearnHub</p>
            <p className="brand-subtitle">корпоративная LMS</p>
          </span>
        </Link>

        <nav className="nav-list" aria-label="Основная навигация">
          {navItems.map((item) => {
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
            <p className="topbar-meta">{activeRole.description}</p>
          </div>

          <div className="role-switcher" aria-label="Роль пользователя">
            {roles.map((item) => (
              <button
                className={item.id === role ? "role-button active" : "role-button"}
                key={item.id}
                onClick={() => setRole(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
