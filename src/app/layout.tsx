import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { LmsProvider } from "@/components/LmsProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnHub LMS",
  description: "Платформа удаленного обучения сотрудников с элементами геймификации"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <LmsProvider>
          <AppShell>{children}</AppShell>
        </LmsProvider>
      </body>
    </html>
  );
}
