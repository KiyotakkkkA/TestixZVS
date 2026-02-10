import { Icon } from "@iconify/react";

import { Button, InputTime, Selector } from "../../../atoms";
import { authStore } from "../../../../stores/authStore";

import type { SelectorOption } from "../../../atoms/Selector";

interface TestsDayStatisticsFiltersPanelProps {
    minPercentageValue: string;
    percentOptions: SelectorOption[];
    onPercentChange: (value: string) => void;
    timeFrom: string;
    timeTo: string;
    onTimeFromChange: (value: string) => void;
    onTimeToChange: (value: string) => void;
    isDownloading: boolean;
    onDownload: () => void;
    onReset: () => void;
}

export const TestsDayStatisticsFiltersPanel = ({
    minPercentageValue,
    percentOptions,
    onPercentChange,
    timeFrom,
    timeTo,
    onTimeFromChange,
    onTimeToChange,
    isDownloading,
    onDownload,
    onReset,
}: TestsDayStatisticsFiltersPanelProps) => (
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
            <InputTime
                label="С"
                value={timeFrom}
                onChange={(event) => onTimeFromChange(event.target.value)}
            />
            <InputTime
                label="По"
                value={timeTo}
                onChange={(event) => onTimeToChange(event.target.value)}
            />
        </div>

        <div className="mt-5 flex flex-col gap-3">
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
