<?php

namespace App\Services\Admin;

use App\Models\Test\TestStatistic;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class AdminStatisticsService
{
    public function testStatistics(array $payload): void
    {
        TestStatistic::create([
            'test_id' => $payload['test_id'],
            'user_id' => auth('sanctum')->user()?->id ?? null,
            'type' => $payload['type'] ?? 'finished',
            'right_answers' => $payload['right_answers'],
            'wrong_answers' => $payload['wrong_answers'],
            'percentage' => $payload['percentage'],
            'time_taken' => $payload['time_taken'] ?? null,
        ]);
    }

    public function getGeneralStatistics(array $filters): array
    {
        $finished = $this->buildStatistics($filters, 'finished', true);
        $started = $this->buildStatistics($filters, 'started', false);

        return [
            'finished' => $finished,
            'started' => $started,
        ];
    }

    private function buildStatistics(array $filters, string $type, bool $applyMinPercentage): array
    {
        $applyFilters = function (Builder $query) use ($filters, $applyMinPercentage): Builder {
            if (!empty($filters['date_from'])) {
                $from = Carbon::parse($filters['date_from'])->startOfDay();
                $query->where('created_at', '>=', $from);
            }

            if (!empty($filters['date_to'])) {
                $to = Carbon::parse($filters['date_to'])->endOfDay();
                $query->where('created_at', '<=', $to);
            }

            if ($applyMinPercentage && isset($filters['min_percentage']) && $filters['min_percentage'] !== '') {
                $query->where('percentage', '>=', $filters['min_percentage']);
            }

            return $query;
        };

        $summaryQuery = $applyFilters(TestStatistic::query()->where('type', $type));
        $totalCompletions = (int) $summaryQuery->count();
        $averagePercentage = (float) ($summaryQuery->avg('percentage') ?? 0);
        $uniqueTests = (int) $summaryQuery->distinct('test_id')->count('test_id');

        $totalsQuery = $applyFilters(TestStatistic::query()->where('type', $type));
        $dailyTotals = $totalsQuery
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('AVG(percentage) as avg_percentage')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $breakdownQuery = $applyFilters(TestStatistic::query()->where('type', $type))->with('test:id,title');
        $dailyTests = $breakdownQuery
            ->selectRaw('DATE(created_at) as date')
            ->addSelect('test_id')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('date', 'test_id')
            ->orderBy('date')
            ->get();

        $testsByDate = [];
        foreach ($dailyTests as $row) {
            $testsByDate[$row->date][] = [
                'id' => $row->test_id,
                'title' => $row->test?->title ?? '—',
                'total' => (int) $row->total,
            ];
        }

        $series = $dailyTotals->map(fn ($row) => [
            'date' => $row->date,
            'total' => (int) $row->total,
            'avg_percentage' => (float) round($row->avg_percentage ?? 0, 2),
            'tests' => $testsByDate[$row->date] ?? [],
        ])->values()->all();

        return [
            'summary' => [
                'total_completions' => $totalCompletions,
                'average_percentage' => round($averagePercentage, 2),
                'unique_tests' => $uniqueTests,
            ],
            'series' => $series,
        ];
    }
}
