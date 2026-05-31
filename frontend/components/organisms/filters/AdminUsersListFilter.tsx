"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  InputSmall,
  PrettyBR,
  Select,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import {
  usersStore,
  type UserSortOption,
  type UserStatusFilter,
} from "@/stores";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

const statusOptions = [
  {
    value: "all",
    label: "Все статусы",
    icon: <Icon icon="mdi:account-multiple-outline" />,
  },
  {
    value: "active",
    label: "Активен",
    icon: <Icon icon="mdi:account-check-outline" />,
  },
  {
    value: "pending",
    label: "Ожидает подтверждения",
    icon: <Icon icon="mdi:account-clock-outline" />,
  },
  {
    value: "blocked",
    label: "Заблокирован",
    icon: <Icon icon="mdi:account-cancel-outline" />,
  },
] satisfies { value: UserStatusFilter; label: string; icon: ReactNode }[];

const sortOptions = [
  {
    value: "name",
    label: "По имени",
    icon: <Icon icon="mdi:sort-alphabetical-ascending" />,
  },
  {
    value: "status",
    label: "По статусу",
    icon: <Icon icon="mdi:list-status" />,
  },
  {
    value: "role",
    label: "По роли",
    icon: <Icon icon="mdi:shield-account-outline" />,
  },
] satisfies { value: UserSortOption; label: string; icon: ReactNode }[];

const selectClassNames = {
  trigger:
    "h-11 w-full rounded border border-main-700 bg-main-900/70 px-3 text-sm text-main-100 outline-none transition hover:bg-main-900 focus:border-main-400",
  menu: "border border-main-700 bg-main-900 text-main-100",
  search: "border-main-700 bg-main-800 text-main-100 placeholder:text-main-500",
  option: "text-main-100 hover:bg-main-800",
  optionLabel: "text-sm",
};

const selectClassName = "w-full min-w-0 [&>div]:w-full";

export const AdminUsersListFilter = observer(() => {
  return (
    <section className="rounded-lg border border-main-700/80 bg-main-800/60 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_260px]">
          <div className="relative block">
            <Icon
              icon="mdi:magnify"
              width={20}
              height={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-main-200"
            />
            <InputSmall
              value={usersStore.query}
              onChange={(event) => usersStore.setQuery(event.target.value)}
              placeholder="Найти пользователя по имени..."
              className="h-11 w-full rounded bg-main-900/70 py-2 pl-10 pr-3"
            />
          </div>

          <Select
            value={usersStore.selectedStatus}
            onChange={(value) =>
              usersStore.setSelectedStatus(value as UserStatusFilter)
            }
            options={statusOptions}
            placeholder="Статус"
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

          <div className="ml-auto grid w-full grid-cols-[1fr_44px] gap-2 sm:w-auto sm:grid-cols-[minmax(14rem,1fr)_44px]">
            <Select
              value={usersStore.sortBy}
              onChange={(value) =>
                usersStore.setSortBy(value as UserSortOption)
              }
              options={sortOptions}
              placeholder="Сортировка"
              className={selectClassName}
              classNames={selectClassNames}
              menuWidth="auto"
              menuPlacement="bottom-right"
            />

            <Button
              onClick={usersStore.toggleSortDirection}
              title={
                usersStore.sortDirection === "asc"
                  ? "Сортировать по убыванию"
                  : "Сортировать по возрастанию"
              }
              className="flex h-11 w-11 items-center justify-center rounded border border-main-700 bg-main-900/70 p-0 text-main-100 transition hover:bg-main-900"
            >
              <span className="sr-only">
                {usersStore.sortDirection === "asc"
                  ? "По возрастанию"
                  : "По убыванию"}
              </span>
              <Icon
                icon={
                  usersStore.sortDirection === "asc"
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
});
