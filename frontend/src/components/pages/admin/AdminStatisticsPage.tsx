import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { Button } from "../../atoms";
import { TestsStatisticsGeneral } from "../../organisms/admin";
import { DataInformalBlock } from "../../molecules/general";
import { AdminStatisticsFiltersPanel } from "../../molecules/filters/admin/AdminStatisticsFiltersPanel";
import {
    useAdminStatisticsAPI,
    useAdminStatisticsManage,
} from "../../../hooks/admin/statistic";

type StatisticsViewMode = "general" | "target";

const formatRangeDate = (value: string) =>
    new Date(value).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

export const AdminStatisticsPage = observer(() => {
    const [viewMode, setViewMode] = useState<StatisticsViewMode>("general");
    const { filters, appliedFilters, updateFilters } =
        useAdminStatisticsManage();
    const { data, isLoading, error } = useAdminStatisticsAPI(appliedFilters);

    const finished = data?.finished ?? {
        summary: {
            total_completions: 0,
            average_percentage: 0,
            unique_tests: 0,
        },
        series: [],
    };
    const started = data?.started ?? {
        summary: {
            total_completions: 0,
            average_percentage: 0,
            unique_tests: 0,
        },
        series: [],
    };

    const percentOptions = useMemo(
        () => [
            { value: "", label: "Любой процент" },
            { value: "50", label: "от 50%" },
            { value: "70", label: "от 70%" },
            { value: "80", label: "от 80%" },
            { value: "90", label: "от 90%" },
            { value: "100", label: "100%" },
        ],
        [],
    );

    const canShiftRange = Boolean(filters.date_from && filters.date_to);

    const shiftRange = (direction: "prev" | "next") => {
        if (!filters.date_from || !filters.date_to) return;

        const from = new Date(filters.date_from);
        const to = new Date(filters.date_to);

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;

        const rangeDays = Math.max(
            1,
            Math.round((to.getTime() - from.getTime()) / 86400000) + 1,
        );
        const delta = direction === "next" ? rangeDays : -rangeDays;

        const nextFrom = new Date(from);
        nextFrom.setDate(nextFrom.getDate() + delta);

        const nextTo = new Date(to);
        nextTo.setDate(nextTo.getDate() + delta);

        updateFilters({
            date_from: nextFrom.toISOString().slice(0, 10),
            date_to: nextTo.toISOString().slice(0, 10),
        });
    };

    const rangeLabel = useMemo(() => {
        if (filters.date_from && filters.date_to) {
            return `${formatRangeDate(filters.date_from)} — ${formatRangeDate(filters.date_to)}`;
        }
        if (filters.date_from) {
            return `с ${formatRangeDate(filters.date_from)}`;
        }
        if (filters.date_to) {
            return `по ${formatRangeDate(filters.date_to)}`;
        }
        return "Весь период";
    }, [filters.date_from, filters.date_to]);

    const handlePercentChange = (value: string) => {
        const parsed = value === "" ? "" : Number(value);
        updateFilters({ min_percentage: Number.isNaN(parsed) ? "" : parsed });
    };

    const handleResetFilters = () => {
        updateFilters({ date_from: "", date_to: "", min_percentage: "" });
    };

    return (
        <div className="flex flex-col gap-4 lg:flex-row animate-fade-in">
            <div className="order-2 flex-1 space-y-4 lg:order-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="text-2xl font-semibold text-slate-800">
                                Статистика
                            </div>
                            <div className="text-sm text-slate-500">
                                Общая динамика прохождений и качество
                                результатов.
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                primary={viewMode === "general"}
                                secondary={viewMode !== "general"}
                                className="px-4 py-2 text-sm"
                                onClick={() => setViewMode("general")}
                            >
                                Общая
                            </Button>
                        </div>
                    </div>
                </div>

                <DataInformalBlock
                    isLoading={isLoading}
                    isError={!!error}
                    loadingMessage="Загрузка статистики..."
                    errorMessage={error || "Не удалось загрузить статистику."}
                />

                {!isLoading && !error && viewMode === "general" && (
                    <div className="space-y-6">
                        <TestsStatisticsGeneral
                            series={finished.series}
                            summary={finished.summary}
                            title="Тестов завершено"
                            totalLabel="Всего завершений"
                            tooltipTotalLabel="Всего завершений"
                        />
                        <TestsStatisticsGeneral
                            series={started.series}
                            summary={started.summary}
                            title="Тестов начато"
                            totalLabel="Всего начато"
                            tooltipTotalLabel="Всего начато"
                        />
                    </div>
                )}

                {!isLoading && !error && viewMode === "target" && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 shadow-sm">
                        Выберите тест, чтобы увидеть детальную статистику. Скоро
                        здесь появятся фильтры и графики по одному тесту.
                    </div>
                )}
            </div>
            <div className="order-1 w-full shrink-0 lg:order-2 lg:max-w-sm">
                <AdminStatisticsFiltersPanel
                    minPercentageValue={String(filters.min_percentage ?? "")}
                    percentOptions={percentOptions}
                    onPercentChange={handlePercentChange}
                    dateFrom={filters.date_from ?? ""}
                    dateTo={filters.date_to ?? ""}
                    onDateFromChange={(value) =>
                        updateFilters({ date_from: value })
                    }
                    onDateToChange={(value) =>
                        updateFilters({ date_to: value })
                    }
                    rangeLabel={rangeLabel}
                    canShiftRange={canShiftRange}
                    isLoading={isLoading}
                    onPrevRange={() => shiftRange("prev")}
                    onNextRange={() => shiftRange("next")}
                    onReset={handleResetFilters}
                />
            </div>
        </div>
    );
});
