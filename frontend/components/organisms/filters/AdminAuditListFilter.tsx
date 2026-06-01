"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  InputSmall,
  PrettyBR,
  Select,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import type { ReactNode } from "react";

export type AuditEventFilter =
  | "all"
  | "created"
  | "updated"
  | "deleted"
  | "access";
export type AuditEntityFilter = "all" | "user" | "test" | "role";
export type AuditSortOption =
  | "createdAt"
  | "eventType"
  | "entityType"
  | "author";
export type AuditSortDirection = "asc" | "desc";

type AdminAuditListFilterProps = {
  query: string;
  eventType: AuditEventFilter;
  entityType: AuditEntityFilter;
  sortBy: AuditSortOption;
  sortDirection: AuditSortDirection;
  onQueryChange: (query: string) => void;
  onEventTypeChange: (eventType: AuditEventFilter) => void;
  onEntityTypeChange: (entityType: AuditEntityFilter) => void;
  onSortByChange: (sortBy: AuditSortOption) => void;
  onSortDirectionToggle: () => void;
};

const eventOptions = [
  {
    value: "all",
    label: "Все события",
    icon: <Icon icon="mdi:clipboard-list-outline" />,
  },
  {
    value: "created",
    label: "Создание",
    icon: <Icon icon="mdi:plus-circle-outline" />,
  },
  {
    value: "updated",
    label: "Изменение",
    icon: <Icon icon="mdi:pencil-outline" />,
  },
  {
    value: "deleted",
    label: "Удаление",
    icon: <Icon icon="mdi:trash-can-outline" />,
  },
  {
    value: "access",
    label: "Доступ",
    icon: <Icon icon="mdi:shield-key-outline" />,
  },
] satisfies { value: AuditEventFilter; label: string; icon: ReactNode }[];

const entityOptions = [
  {
    value: "all",
    label: "Все сущности",
    icon: <Icon icon="mdi:shape-outline" />,
  },
  {
    value: "user",
    label: "Пользователи",
    icon: <Icon icon="mdi:account-outline" />,
  },
  {
    value: "test",
    label: "Тесты",
    icon: <Icon icon="mdi:clipboard-check-outline" />,
  },
  {
    value: "role",
    label: "Роли",
    icon: <Icon icon="mdi:shield-account-outline" />,
  },
] satisfies { value: AuditEntityFilter; label: string; icon: ReactNode }[];

const sortOptions = [
  {
    value: "createdAt",
    label: "По дате",
    icon: <Icon icon="mdi:calendar-clock-outline" />,
  },
  {
    value: "eventType",
    label: "По событию",
    icon: <Icon icon="mdi:format-list-bulleted-type" />,
  },
  {
    value: "entityType",
    label: "По сущности",
    icon: <Icon icon="mdi:shape-outline" />,
  },
  {
    value: "author",
    label: "По автору",
    icon: <Icon icon="mdi:account-edit-outline" />,
  },
] satisfies { value: AuditSortOption; label: string; icon: ReactNode }[];

const selectClassNames = {
  trigger:
    "h-11 w-full rounded border border-main-700 bg-main-900/70 px-3 text-sm text-main-100 outline-none transition hover:bg-main-900 focus:border-main-400",
  menu: "border border-main-700 bg-main-900 text-main-100",
  search: "border-main-700 bg-main-800 text-main-100 placeholder:text-main-500",
  option: "text-main-100 hover:bg-main-800",
  optionLabel: "text-sm",
};

const selectClassName = "w-full min-w-0 [&>div]:w-full";

export const AdminAuditListFilter = ({
  query,
  eventType,
  entityType,
  sortBy,
  sortDirection,
  onQueryChange,
  onEventTypeChange,
  onEntityTypeChange,
  onSortByChange,
  onSortDirectionToggle,
}: AdminAuditListFilterProps) => {
  return (
    <section className="rounded-lg border border-main-700/80 bg-main-800/60 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_240px_240px]">
          <div className="relative block">
            <Icon
              icon="mdi:magnify"
              width={20}
              height={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-main-200"
            />
            <InputSmall
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Найти по автору, сущности, UUID..."
              className="h-11 w-full rounded bg-main-900/70 py-2 pl-10 pr-3"
            />
          </div>

          <Select
            value={eventType}
            onChange={(value) => onEventTypeChange(value as AuditEventFilter)}
            options={eventOptions}
            placeholder="Тип события"
            className={selectClassName}
            classNames={selectClassNames}
            menuWidth="auto"
            menuPlacement="bottom-right"
          />

          <Select
            value={entityType}
            onChange={(value) => onEntityTypeChange(value as AuditEntityFilter)}
            options={entityOptions}
            placeholder="Сущность"
            className={selectClassName}
            classNames={selectClassNames}
            menuWidth="auto"
            menuPlacement="bottom-right"
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="hidden text-left text-sm font-medium text-main-300 sm:block">
            Сортировать по
          </span>
          <PrettyBR className="sm:hidden col-span-2" label="Сортировка" />

          <div className="ml-auto grid w-full grid-cols-[1fr_44px] gap-2 sm:w-auto sm:grid-cols-[minmax(11.75rem,1fr)_44px]">
            <Select
              value={sortBy}
              onChange={(value) => onSortByChange(value as AuditSortOption)}
              options={sortOptions}
              placeholder="Сортировка"
              className={selectClassName}
              classNames={selectClassNames}
              menuWidth="auto"
              menuPlacement="bottom-right"
            />

            <Button
              onClick={onSortDirectionToggle}
              title={
                sortDirection === "asc"
                  ? "Сортировать по убыванию"
                  : "Сортировать по возрастанию"
              }
              className="flex h-11 w-11 items-center justify-center rounded border border-main-700 bg-main-900/70 p-0 text-main-100 transition hover:bg-main-900"
            >
              <span className="sr-only">
                {sortDirection === "asc" ? "По возрастанию" : "По убыванию"}
              </span>
              <Icon
                icon={
                  sortDirection === "asc"
                    ? "mdi:sort-ascending"
                    : "mdi:sort-descending"
                }
                width={22}
                height={22}
              />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
