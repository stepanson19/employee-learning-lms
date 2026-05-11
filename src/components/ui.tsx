import type { ReactNode } from "react";

export function SectionHeader({
  title,
  description,
  action
}: Readonly<{ title: string; description?: string; action?: ReactNode }>) {
  return (
    <div className="section-header">
      <div>
        <h1 className="section-title">{title}</h1>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  note
}: Readonly<{ label: string; value: string | number; note?: string }>) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {note ? <p className="metric-note">{note}</p> : null}
    </div>
  );
}

export function ProgressBar({ value, label }: Readonly<{ value: number; label?: string }>) {
  return (
    <div className="stack">
      {label ? (
        <div className="row">
          <span className="muted">{label}</span>
          <strong>{value}%</strong>
        </div>
      ) : null}
      <div className="progress-track" aria-label={label} aria-valuemax={100} aria-valuemin={0} aria-valuenow={value} role="progressbar">
        <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function StatusPill({ children, tone = "blue" }: Readonly<{ children: ReactNode; tone?: "blue" | "green" | "orange" | "violet" | "red" }>) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function BadgePill({ children, tone = "violet" }: Readonly<{ children: ReactNode; tone?: "blue" | "green" | "orange" | "violet" | "red" }>) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function EmptyState({ title, text }: Readonly<{ title: string; text: string }>) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
