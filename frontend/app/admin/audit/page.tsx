"use client";

import { Pagination } from "@/components/atoms";
import {
  AdminAuditListFilter,
  type AuditEntityFilter,
  type AuditEventFilter,
  type AuditSortDirection,
  type AuditSortOption,
} from "@/components/organisms/filters";
import { endpoints } from "@/services/endpoints";
import { useApi } from "@/hooks/useApi";
import type {
  AuditEventType,
  AuditLogListResponse,
} from "@/models/AuditLog";
import {
  Badge,
  Button,
  EmptyState,
  ScrollArea,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useMemo, useState } from "react";

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
    timeStyle: "short",
  }).format(new Date(value));
};

export default function AdminAuditPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState<AuditEventFilter>("all");
  const [entityType, setEntityType] = useState<AuditEntityFilter>("all");
  const [sortBy, setSortBy] = useState<AuditSortOption>("createdAt");
  const [sortDirection, setSortDirection] =
    useState<AuditSortDirection>("desc");

  const url = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sortBy,
      sortDirection,
    });

    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("search", normalizedQuery);
    }

    if (eventType !== "all") {
      params.set("eventType", eventType);
    }

    if (entityType !== "all") {
      params.set("entityType", entityType);
    }

    return `${endpoints.admin.audit.list}?${params.toString()}`;
  }, [entityType, eventType, page, perPage, query, sortBy, sortDirection]);

  const { data, error, loading } = useApi<AuditLogListResponse>(url);
  const logs = data?.data ?? [];
  const meta = data?.meta ?? {
    currentPage: page,
    perPage,
    total: 0,
    lastPage: 1,
    from: null,
    to: null,
  };

  const resetFilters = () => {
    setQuery("");
    setEventType("all");
    setEntityType("all");
    setSortBy("createdAt");
    setSortDirection("desc");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-lg border border-main-700 bg-main-800/55 p-5">
        <p className="inline-flex items-center gap-2 rounded bg-main-700/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-main-300">
          <Icon icon="mdi:clipboard-text-clock" width={16} height={16} />
          Журнал аудита
        </p>
        <h1 className="mt-4 text-2xl font-extrabold text-main-50">
          События администрирования
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-main-300">
          История действий по пользователям, тестам, ролям и доступам с
          подробной трассировкой изменений.
        </p>
      </section>

      <AdminAuditListFilter
        query={query}
        eventType={eventType}
        entityType={entityType}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(1);
        }}
        onEventTypeChange={(value) => {
          setEventType(value);
          setPage(1);
        }}
        onEntityTypeChange={(value) => {
          setEntityType(value);
          setPage(1);
        }}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortDirectionToggle={() => {
          setSortDirection((currentDirection) =>
            currentDirection === "asc" ? "desc" : "asc",
          );
          setPage(1);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="danger"
          onClick={resetFilters}
          className="px-3 py-1.5"
        >
          Сбросить фильтры
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-main-700 bg-main-800/45">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-10 text-sm text-main-300">
            <Icon
              icon="mdi:loading"
              width={24}
              height={24}
              className="animate-spin"
            />
            Загружаем журнал аудита...
          </div>
        ) : error ? (
          <EmptyState
            icon={<Icon icon="mdi:alert-circle-outline" width={48} height={48} />}
            className="bg-main-800/35 p-10 m-3"
            title="Не удалось загрузить аудит"
            description={error}
          />
        ) : logs.length > 0 ? (
          <>
            <div className="border-b border-main-700 p-2 sm:p-3">
              <Pagination
                page={meta.currentPage}
                perPage={meta.perPage}
                total={meta.total}
                lastPage={meta.lastPage}
                from={meta.from}
                to={meta.to}
                disabled={loading}
                onPageChange={setPage}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                }}
              />
            </div>
            <ScrollArea orientation="horizontal" className="w-full">
              <table className="min-w-230 w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-main-700 bg-main-800/80">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                      Тип события
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                      Автор
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                      Сущность
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                      Описание
                    </th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
                      Дата
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-main-300">
                      Детали
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.uuid}
                      className="border-b border-main-800 last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm">
                        <Badge variant={eventBadgeVariants[log.eventType]}>
                          {log.eventLabel}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <p className="font-semibold text-main-50">
                          {log.authorName ?? "Система"}
                        </p>
                        <p className="mt-1 text-xs text-main-400">
                          {log.authorEmail ?? "system"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <p className="font-semibold text-main-50">
                          {log.entityLabelHuman}
                        </p>
                        <p className="mt-1 text-xs text-main-400">
                          {log.entityLabel ?? log.entityType}
                        </p>
                      </td>
                      <td className="max-w-90 px-5 py-4 text-sm text-main-300">
                        {log.summary}
                      </td>
                      <td className="px-5 py-4 text-sm text-main-300">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/admin/audit/${log.uuid}`}>
                          <Button className="gap-2 px-3 py-1.5">
                            <Icon
                              icon="mdi:open-in-new"
                              width={18}
                              height={18}
                            />
                            Раскрыть
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </>
        ) : (
          <EmptyState
            icon={<Icon icon="mdi:clipboard-search-outline" width={48} height={48} />}
            className="bg-main-800/35 p-10 m-3"
            title="Журнал аудита пуст"
            description="События появятся после административных действий."
          />
        )}
      </section>
    </div>
  );
}
