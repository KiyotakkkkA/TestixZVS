import { Icon } from "@iconify/react";

import { Button, InputDate, Selector } from "../../../atoms";
import { authStore } from "../../../../stores/authStore";

import type { SelectorOption } from "../../../atoms/Selector";
import type { AdminAuditActionType } from "../../../../types/admin/AdminAudit";

interface AdminAuditFiltersPanelProps {
    actionValue: string;
    actionOptions: SelectorOption[];
    onActionChange: (value: AdminAuditActionType) => void;
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    pagination: { page: number; last_page: number };
    isLoading: boolean;
    isDownloading: boolean;
    onPrevPage: () => void;
    onNextPage: () => void;
    onDownload: () => void;
    onReset: () => void;
}

export const AdminAuditFiltersPanel = ({
    actionValue,
    actionOptions,
    onActionChange,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    pagination,
    isLoading,
    isDownloading,
    onPrevPage,
    onNextPage,
    onDownload,
    onReset,
}: AdminAuditFiltersPanelProps) => (
    <div className="sm:w-full lg:w-fit rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="grid gap-4">
            <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Тип события
                </div>
                <Selector
                    value={actionValue}
                    options={actionOptions}
                    onChange={(value) =>
                        onActionChange(value as AdminAuditActionType)
                    }
                />
            </div>
            <InputDate
                label="С"
                value={dateFrom}
                onChange={(event) => onDateFromChange(event.target.value)}
            />
            <InputDate
                label="По"
                value={dateTo}
                onChange={(event) => onDateToChange(event.target.value)}
            />
        </div>

        <div className="mt-5 flex flex-col gap-3">
            <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex sm:flex-row">
                <Button
                    secondary
                    className="w-full px-4 py-2 text-sm sm:w-auto"
                    disabled={pagination.page <= 1 || isLoading}
                    onClick={onPrevPage}
                >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                </Button>
                <div className="text-center text-sm text-slate-500 sm:text-left sm:flex-1">
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
                    className="w-full px-4 py-2 text-sm sm:w-auto"
                    disabled={
                        pagination.page >= pagination.last_page || isLoading
                    }
                    onClick={onNextPage}
                >
                    <Icon icon="mdi:arrow-right" className="h-5 w-5" />
                </Button>
            </div>
            <div className="grid w-full gap-2 sm:flex sm:flex-row sm:items-center">
                {authStore.hasPermissions(["make reports"]) && (
                    <Button
                        secondary
                        className="w-full p-2 sm:w-auto"
                        isLoading={isDownloading}
                        onClick={onDownload}
                        disabled={isDownloading}
                    >
                        <Icon icon="mdi:file-pdf" className="h-5 w-5" />
                    </Button>
                )}
                <Button
                    dangerInverted
                    className="w-full px-4 py-2 text-sm sm:flex-1"
                    onClick={onReset}
                >
                    Сбросить фильтры
                </Button>
            </div>
        </div>
    </div>
);
