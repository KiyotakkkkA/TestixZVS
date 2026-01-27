import { useMemo } from 'react';

import type { AdminStatisticsDay, AdminStatisticsSummary } from '../../../types/admin/AdminStatistics';

export type TestsStatisticsGeneralProps = {
  series: AdminStatisticsDay[];
  summary: AdminStatisticsSummary;
  title?: string;
  subtitle?: string;
  totalLabel?: string;
  tooltipTotalLabel?: string;
};

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });

const formatFullDate = (value: string) =>
  new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

export const TestsStatisticsGeneral = ({
  series,
  summary,
  title = 'Прохождения тестов',
  subtitle = 'Динамика прохождений и популярные тесты по дням.',
  totalLabel = 'Всего прохождений',
  tooltipTotalLabel = 'Всего прохождений',
}: TestsStatisticsGeneralProps) => {
  const maxTotal = useMemo(() => Math.max(1, ...series.map((item) => item.total)), [series]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-semibold text-slate-800">{title}</div>
          <div className="text-sm text-slate-500">{subtitle}</div>
        </div>
        <div className="text-xs text-slate-400">Наведи на столбец, чтобы увидеть детали</div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{totalLabel}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">{summary.total_completions}</div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Средний процент</div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">{summary.average_percentage}%</div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Различных тестов пройдено</div>
          <div className="mt-2 text-2xl font-semibold text-slate-800">{summary.unique_tests}</div>
        </div>
      </div>

      <div className="mt-6">
        {series.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            Данных пока нет. Попробуйте изменить фильтры.
          </div>
        ) : (
          <div className="flex h-64 items-end gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
            {series.map((day) => {
              const height = Math.max(6, Math.round((day.total / maxTotal) * 100));

              return (
                <div key={day.date} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div className="absolute -top-2 left-1/2 z-10 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-lg group-hover:block">
                    <div className="text-sm font-semibold text-slate-800">{formatFullDate(day.date)}</div>
                    <div className="mt-1">{tooltipTotalLabel}: <span className="font-semibold text-slate-800">{day.total}</span></div>
                    <div className="mt-1">Средний процент: <span className="font-semibold text-slate-800">{day.avg_percentage}%</span></div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Тесты</div>
                    <div className="mt-1 max-h-28 space-y-1 overflow-auto">
                      {day.tests.length ? day.tests.map((test) => (
                        <div key={test.id} className="flex items-center justify-between gap-2">
                          <span className="truncate">{test.title}</span>
                          <span className="font-semibold text-slate-700">{test.total}</span>
                        </div>
                      )) : (
                        <div className="text-slate-400">Нет данных</div>
                      )}
                    </div>
                  </div>
                  <div
                    className="rounded-md bg-indigo-500/80 transition-all duration-200 group-hover:bg-indigo-600"
                    style={{ height: `${height}%` }}
                  />
                  <div className="mt-2 text-center text-[10px] font-medium text-slate-500">
                    {formatShortDate(day.date)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
