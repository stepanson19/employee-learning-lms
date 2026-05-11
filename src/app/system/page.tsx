"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Database, Download, RotateCcw, Upload } from "lucide-react";
import { MetricCard, SectionHeader, StatusPill } from "@/components/ui";
import { useLms } from "@/components/LmsProvider";
import type { AppState } from "@/types/lms";
import type { StorageStatus } from "@/lib/storage-status";

type StatusResponse = { ok: true; data: StorageStatus } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImportEnvelope(value: unknown): value is { state: Partial<AppState> } {
  return isRecord(value) && isRecord(value.state);
}

export default function SystemPage() {
  const { importState, resetDemo, state } = useLms();
  const [status, setStatus] = useState<StorageStatus | null>(null);
  const [message, setMessage] = useState("");
  const exportHref = useMemo(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      state
    };

    return `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(payload, null, 2))}`;
  }, [state]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/lms/status", { cache: "no-store" });
        const payload = (await response.json()) as StatusResponse;

        if (!cancelled && response.ok && payload.ok) {
          setStatus(payload.data);
        }
      } catch {
        if (!cancelled) {
          setMessage("не удалось загрузить статус хранилища");
        }
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, [state]);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;
      const nextState = isImportEnvelope(parsed) ? parsed.state : parsed;

      if (!isRecord(nextState)) {
        throw new Error("invalid lms snapshot");
      }

      importState(nextState);
      setMessage("снимок данных импортирован");
      event.target.value = "";
    } catch {
      setMessage("файл не похож на корректный JSON-снимок LMS");
    }
  }

  function handleReset() {
    resetDemo();
    setMessage("демо-данные сброшены");
  }

  return (
    <div className="page page-grid">
      <SectionHeader
        title="Системное управление"
        description="контроль хранилища, резервное копирование, импорт состояния и подготовка к подключению постоянной БД"
        action={
          <StatusPill tone={status?.storageMode === "postgres" ? "green" : "orange"}>
            <Database size={14} />
            {status?.storageLabel ?? "проверка"}
          </StatusPill>
        }
      />

      <section className="metric-grid">
        <MetricCard label="хранилище" value={status?.storageLabel ?? "загрузка"} note={status?.databaseConfigured ? "DATABASE_URL задан" : "DATABASE_URL не задан"} />
        <MetricCard label="курсы" value={status?.counts.courses ?? state.courses.length} note="в снимке LMS" />
        <MetricCard label="пользователи" value={status?.counts.users ?? state.users.length} note="аккаунты и роли" />
        <MetricCard label="попытки тестов" value={status?.counts.quizAttempts ?? state.quizAttempts.length} note="история проверок" />
      </section>

      <section className="split-grid">
        <div className="card card-pad stack">
          <SectionHeader title="Резервное копирование" description="сохранение и перенос состояния платформы" />
          <div className="system-actions">
            <a className="primary-button" download="learnhub-state-backup.json" href={exportHref}>
              <Download size={16} />
              скачать JSON
            </a>
            <label className="secondary-button">
              <Upload size={16} />
              импорт JSON
              <input accept="application/json" className="visually-hidden" onChange={handleImport} type="file" />
            </label>
            <button className="secondary-button" onClick={handleReset} type="button">
              <RotateCcw size={16} />
              сбросить демо
            </button>
          </div>
          {message ? <p className="form-note">{message}</p> : null}
          <p className="item-text">
            Экспорт сохраняет пользователей, курсы, прогресс, тесты, награды, отзывы, назначения и журнал XP. Импорт можно использовать для переноса демо-стенда между окружениями.
          </p>
        </div>

        <aside className="card card-pad stack">
          <SectionHeader title="Готовность БД" />
          <div className="list-item">
            <strong>Текущий режим</strong>
            <p className="item-text">{status?.storageMode === "postgres" ? "используется PostgreSQL" : "используется локальный JSON fallback"}</p>
          </div>
          <div className="list-item">
            <strong>Подключение PostgreSQL</strong>
            <p className="item-text">
              добавьте <code>DATABASE_URL</code> в переменные окружения Vercel, после чего API автоматически перейдет на PostgreSQL
            </p>
          </div>
          <div className="list-item">
            <strong>Схема</strong>
            <p className="item-text">
              таблица <code>lms_state_snapshots</code> создается автоматически, SQL также лежит в <code>docs/postgres-schema.sql</code>
            </p>
          </div>
        </aside>
      </section>

      <section className="card card-pad table-card">
        <SectionHeader title="Состав снимка" description="что сейчас сохранено в состоянии платформы" />
        <table className="table">
          <thead>
            <tr>
              <th>раздел</th>
              <th>количество</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Пользователи", state.users.length],
              ["Курсы", state.courses.length],
              ["Прогресс", state.progressRecords.length],
              ["Вопросы тестов", state.quizQuestions.length],
              ["Назначения", state.courseAssignments.length],
              ["Отзывы", state.feedbackItems.length],
              ["XP операции", state.xpTransactions.length]
            ].map(([label, value]) => (
              <tr key={label}>
                <td>{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
