import { Icon } from "@iconify/react";
import {
  Button,
  InputSmall,
  PrettyBR,
  Select,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { testsStore, type SortOption } from "@/stores";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";

const sortOptions = [
  {
    value: "questions",
    label: "По количеству вопросов",
    icon: <Icon icon="mdi:help-circle-outline" />,
  },
  {
    value: "duration",
    label: "По времени",
    icon: <Icon icon="mdi:timer-outline" />,
  },
  {
    value: "rating",
    label: "По средней оценке",
    icon: <Icon icon="mdi:star-outline" />,
  },
] satisfies { value: SortOption; label: string; icon: ReactNode }[];

const selectClassNames = {
  trigger:
    "h-11 min-w-56 rounded border border-main-700 bg-main-900/70 px-3 text-sm text-main-100 outline-none transition hover:bg-main-900 focus:border-main-400",
  menu: "border border-main-700 bg-main-900 text-main-100",
  search: "border-main-700 bg-main-800 text-main-100 placeholder:text-main-500",
  option: "text-main-100 hover:bg-main-800",
  optionLabel: "text-sm",
};

export const TestsListFilter = observer(() => {
  return (
    <section className="rounded-lg border border-main-700/80 bg-main-800/60 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="relative block">
          <Icon
            icon="mdi:magnify"
            width={20}
            height={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-main-200"
          />
          <InputSmall
            value={testsStore.query}
            onChange={(event) => testsStore.setQuery(event.target.value)}
            placeholder="Найти тест по названию..."
            className="h-11 w-full rounded bg-main-900/70 py-2 pl-10 pr-3"
          />
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-left text-sm font-medium text-main-300 hidden sm:block">
            Сортировать по
          </span>
          <PrettyBR className="sm:hidden col-span-2" label="Сортировка" />

          <div className="ml-auto grid w-full grid-cols-[1fr_44px] gap-3 sm:w-auto sm:grid-cols-[minmax(14rem,1fr)_44px]">
            <Select
              value={testsStore.sortBy}
              onChange={(value) => testsStore.setSortBy(value as SortOption)}
              options={sortOptions}
              placeholder="Сортировка"
              classNames={selectClassNames}
            />

            <Button
              onClick={testsStore.toggleSortDirection}
              title={
                testsStore.sortDirection === "asc"
                  ? "Сортировать по убыванию"
                  : "Сортировать по возрастанию"
              }
              className="flex h-11 w-11 items-center justify-center rounded border border-main-700 bg-main-900/70 p-0 text-main-100 transition hover:bg-main-900"
            >
              <span className="sr-only">
                {testsStore.sortDirection === "asc"
                  ? "По возрастанию"
                  : "По убыванию"}
              </span>
              <Icon
                icon={
                  testsStore.sortDirection === "asc"
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
