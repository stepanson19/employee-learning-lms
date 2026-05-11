import Link from "next/link";
import { SectionHeader } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="page">
      <SectionHeader title="Раздел не найден" description="Такого учебного раздела нет в демонстрационной платформе." />
      <Link className="pill pill-blue" href="/">
        вернуться на дашборд
      </Link>
    </div>
  );
}
