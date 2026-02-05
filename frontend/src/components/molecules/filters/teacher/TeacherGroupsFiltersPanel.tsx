import { Icon } from "@iconify/react";

import { Button, InputSmall } from "../../../atoms";

interface TeacherGroupsFiltersPanelProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    pagination: { page: number; last_page: number };
    isLoading: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
    onReset: () => void;
}

export const TeacherGroupsFiltersPanel = ({
    searchValue,
    onSearchChange,
    pagination,
    isLoading,
    onPrevPage,
    onNextPage,
    onReset,
}: TeacherGroupsFiltersPanelProps) => (
    <div className="sm:w-full lg:w-fit rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="grid gap-4">
            <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Поиск
                </div>
                <InputSmall
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Название группы"
                    className="p-2"
                />
            </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                    secondary
                    className="px-4 py-2 text-sm"
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={onPrevPage}
                >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                </Button>
                <div className="text-center text-sm text-slate-500 sm:text-left">
                    Страница{" "}
                    <span className="font-semibold text-slate-700">
                        {pagination.page}
                    </span>{" "}
                    из{" "}
                    <span className="font-semibold text-slate-700">
                        {pagination.last_page}
                    </span>
                </div>
                <Button
                    primary
                    className="px-4 py-2 text-sm"
                    disabled={
                        pagination.page >= pagination.last_page || isLoading
                    }
                    onClick={onNextPage}
                >
                    <Icon icon="mdi:arrow-right" className="h-5 w-5" />
                </Button>
            </div>
            <Button
                dangerInverted
                className="px-4 py-2 text-sm"
                onClick={onReset}
            >
                Сбросить фильтры
            </Button>
        </div>
    </div>
);
