import { Icon } from "@iconify/react";

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
    onPrevRange: () => void;
    onNextRange: () => void;
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
    onPrevRange,
    onNextRange,
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
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                    secondary
                    className="px-4 py-2 text-sm"
                    disabled={!canShiftRange || isLoading}
                    onClick={onPrevRange}
                >
                    <Icon icon="mdi:arrow-left" className="h-5 w-5" />
                </Button>
                <div className="text-center text-sm text-slate-500 sm:text-left">
                    Период:{" "}
                    <span className="font-semibold text-slate-700">
                        {rangeLabel}
                    </span>
                </div>
                <Button
                    primary
                    className="px-4 py-2 text-sm"
                    disabled={!canShiftRange || isLoading}
                    onClick={onNextRange}
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
