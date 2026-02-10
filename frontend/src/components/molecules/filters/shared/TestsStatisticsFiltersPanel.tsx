import { Icon } from "@iconify/react";

import { authStore } from "../../../../stores/authStore";
import { Button, InputDate, Selector } from "../../../atoms";

import type { SelectorOption } from "../../../atoms/Selector";

interface TestsStatisticsFiltersPanelProps {
    minPercentageValue: string;
    percentOptions: SelectorOption[];
    onPercentChange: (value: string) => void;
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    rangeLabel: string;
    canShiftRange: boolean;
    isLoading: boolean;
    isDownloading: boolean;
    onPrevRange: () => void;
    onNextRange: () => void;
    onDownload: () => void;
    onReset: () => void;
}

export const TestsStatisticsFiltersPanel = ({
    minPercentageValue,
    percentOptions,
    onPercentChange,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    rangeLabel,
    canShiftRange,
    isLoading,
    isDownloading,
    onPrevRange,
    onNextRange,
    onDownload,
    onReset,
}: TestsStatisticsFiltersPanelProps) => (
    <div className="sm:w-full lg:w-fit rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
        <div className="grid gap-4">
            <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Процент прохождения
                </div>
                <Selector
                    value={minPercentageValue}
                    options={percentOptions}
                    onChange={onPercentChange}
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
                    disabled={!canShiftRange || isLoading}
                    onClick={onPrevRange}
                >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                </Button>
                <div className="text-center text-sm text-slate-500 sm:text-left sm:flex-1">
                    Период:{" "}
                    <span className="font-semibold text-slate-700">
                        {rangeLabel}
                    </span>
                </div>
                <Button
                    primary
                    className="w-full px-4 py-2 text-sm sm:w-auto"
                    disabled={!canShiftRange || isLoading}
                    onClick={onNextRange}
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
                        <Icon icon="mdi:file-excel" className="h-5 w-5" />
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
