import { useMemo, useState } from 'react';

import { Button, InputDate, Selector, Spinner } from '../../atoms';
import { TestsStatisticsGeneral } from '../../organisms/admin';
import { useAdminStatistics } from '../../../hooks/admin/useAdminStatistics';

type StatisticsViewMode = 'general' | 'target';

const formatRangeDate = (value: string) =>
  new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });

export const AdminStatisticsPage = () => {
  const [viewMode, setViewMode] = useState<StatisticsViewMode>('general');
  const { data, isLoading, error, filters, updateFilters } = useAdminStatistics();

  const finished = data?.finished ?? { summary: { total_completions: 0, average_percentage: 0, unique_tests: 0 }, series: [] };
  const started = data?.started ?? { summary: { total_completions: 0, average_percentage: 0, unique_tests: 0 }, series: [] };

  const percentOptions = useMemo(
    () => [
      { value: '', label: 'Любой процент' },
      { value: '50', label: 'от 50%' },
      { value: '70', label: 'от 70%' },
      { value: '80', label: 'от 80%' },
      { value: '90', label: 'от 90%' },
      { value: '100', label: '100%' },
    ],
    []
  );

  const canShiftRange = Boolean(filters.date_from && filters.date_to);

  const shiftRange = (direction: 'prev' | 'next') => {
    if (!filters.date_from || !filters.date_to) return;

    const from = new Date(filters.date_from);
    const to = new Date(filters.date_to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;

    const rangeDays = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1);
    const delta = direction === 'next' ? rangeDays : -rangeDays;

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
    return 'Весь период';
  }, [filters.date_from, filters.date_to]);

  const handlePercentChange = (value: string) => {
    const parsed = value === '' ? '' : Number(value);
    updateFilters({ min_percentage: Number.isNaN(parsed) ? '' : parsed });
  };

  const handleResetFilters = () => {
    updateFilters({ date_from: '', date_to: '', min_percentage: '' });
  };

  return (
    <div className="w-full space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-2xl font-semibold text-slate-800">Статистика</div>
            <div className="text-sm text-slate-500">Общая динамика прохождений и качество результатов.</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              primary={viewMode === 'general'}
              secondary={viewMode !== 'general'}
              className="px-4 py-2 text-sm"
              onClick={() => setViewMode('general')}
            >
              Общая
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Процент прохождения</div>
              <Selector
                value={String(filters.min_percentage ?? '')}
                options={percentOptions}
                onChange={handlePercentChange}
              />
            </div>
            <InputDate
              label="С"
              value={filters.date_from ?? ''}
              onChange={(event) => updateFilters({ date_from: event.target.value })}
            />
            <InputDate
              label="По"
              value={filters.date_to ?? ''}
              onChange={(event) => updateFilters({ date_to: event.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              secondary
              className="w-full px-4 py-2 text-sm sm:w-auto"
              disabled={!canShiftRange || isLoading}
              onClick={() => shiftRange('prev')}
            >
              Назад
            </Button>
            <div className="text-center text-sm text-slate-500 sm:text-left">
              Период: <span className="font-semibold text-slate-700">{rangeLabel}</span>
            </div>
            <Button
              primary
              className="w-full px-4 py-2 text-sm sm:w-auto"
              disabled={!canShiftRange || isLoading}
              onClick={() => shiftRange('next')}
            >
              Вперёд
            </Button>
          </div>
          <Button
            dangerInverted
            className="w-full px-4 py-2 text-sm sm:w-auto"
            onClick={handleResetFilters}
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4" />
            Загружаем статистику...
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!isLoading && !error && viewMode === 'general' && (
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

      {!isLoading && !error && viewMode === 'target' && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Выберите тест, чтобы увидеть детальную статистику. Скоро здесь появятся фильтры и графики по одному тесту.
        </div>
      )}
    </div>
  );
};