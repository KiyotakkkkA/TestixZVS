"use client";

import { endpoints } from "@/services/endpoints";
import { useApi } from "@/hooks/useApi";
import type { AuditEventType, AuditLogDetails } from "@/models/AuditLog";
import { Badge, Button, EmptyState } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useParams } from "next/navigation";

const eventBadgeVariants: Record<
  AuditEventType,
  "success" | "warning" | "danger" | "info"
> = {
  created: "success",
  updated: "warning",
  deleted: "danger",
  access: "info",
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
};

const JsonBlock = ({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown>;
}) => {
  const hasValue = Object.keys(value).length > 0;

  return (
    <section className="rounded-lg border border-main-700 bg-main-800/45 p-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-main-300">
        {title}
      </h2>
      {hasValue ? (
        <pre className="mt-3 max-h-96 overflow-auto rounded-md border border-main-700 bg-main-900/70 p-3 text-xs leading-5 text-main-200">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : (
        <p className="mt-3 text-sm text-main-400">Нет данных</p>
      )}
    </section>
  );
};

export default function AdminAuditDetailsPage() {
  const params = useParams<{ uuid: string }>();
  const {
    data: log,
    error,
    loading,
  } = useApi<AuditLogDetails>(endpoints.admin.audit.detail(params.uuid));

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-lg border border-main-700 bg-main-800/45 p-10 text-sm text-main-300">
        <Icon
          icon="mdi:loading"
          width={24}
          height={24}
          className="animate-spin"
        />
        Загружаем событие аудита...
      </div>
    );
  }

  if (error || !log) {
    return (
      <EmptyState
        icon={<Icon icon="mdi:alert-circle-outline" width={48} height={48} />}
        className="bg-main-800/35 p-10"
        title="Событие не найдено"
        description={error ?? "Не удалось загрузить запись журнала аудита."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-main-700 bg-main-800/55 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={eventBadgeVariants[log.eventType]}>
                {log.eventLabel}
              </Badge>
              <span className="text-xs font-semibold uppercase tracking-wide text-main-400">
                {log.uuid}
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-main-50">
              {log.summary}
            </h1>
            <p className="mt-2 text-sm text-main-300">
              {formatDate(log.createdAt)}
            </p>
          </div>
          <Link href="/admin/audit">
            <Button variant="secondary" className="gap-2 px-3 py-1.5">
              <Icon icon="mdi:arrow-left" width={18} height={18} />К журналу
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-main-700 bg-main-800/45 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-main-400">
            Автор
          </p>
          <p className="mt-3 text-sm font-semibold text-main-50">
            {log.authorName ?? "Система"}
          </p>
          <p className="mt-1 text-xs text-main-400">
            {log.authorEmail ?? "system"}
          </p>
        </div>
        <div className="rounded-lg border border-main-700 bg-main-800/45 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-main-400">
            Сущность
          </p>
          <p className="mt-3 text-sm font-semibold text-main-50">
            {log.entityLabelHuman}
          </p>
          <p className="mt-1 text-xs text-main-400">
            {log.entityLabel ?? log.entityType}
          </p>
        </div>
        <div className="rounded-lg border border-main-700 bg-main-800/45 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-main-400">
            Техническая сводка
          </p>
          <p className="mt-3 text-sm text-main-300">
            IP: <span className="text-main-50">{log.ipAddress ?? "-"}</span>
          </p>
          <p className="mt-1 truncate text-xs text-main-400">
            {log.userAgent ?? "Нет user-agent"}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <JsonBlock title="До изменения" value={log.oldValues} />
        <JsonBlock title="После изменения" value={log.newValues} />
      </section>

      <JsonBlock title="Дополнительные данные" value={log.metadata} />
    </div>
  );
}
