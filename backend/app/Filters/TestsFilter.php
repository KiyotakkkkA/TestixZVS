<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class TestsFilter extends QueryFilter
{
    private const MIN_PER_PAGE = 5;

    private const MAX_PER_PAGE = 100;

    private const SORT_COLUMNS = [
        'title' => 'title',
        'duration' => 'estimated_pass_time_int',
        'createdAt' => 'created_at',
    ];

    protected function ignoredKeys(): array
    {
        return ['page', 'perPage', 'sortDirection'];
    }

    public function search(Builder $builder, string $search): void
    {
        $normalizedSearch = trim($search);

        $builder->where(static function (Builder $query) use ($normalizedSearch): void {
            $query
                ->where('title', 'like', "%{$normalizedSearch}%")
                ->orWhere('description', 'like', "%{$normalizedSearch}%");
        });
    }

    public function sortBy(Builder $builder, string $sortBy): void
    {
        $column = self::SORT_COLUMNS[$sortBy] ?? self::SORT_COLUMNS['createdAt'];

        $builder->orderBy($column, $this->sortDirection());
    }

    public function page(): int
    {
        return max((int) $this->request->query('page', 1), 1);
    }

    public function perPage(): int
    {
        $perPage = (int) $this->request->query('perPage', 20);

        return min(max($perPage, self::MIN_PER_PAGE), self::MAX_PER_PAGE);
    }

    private function sortDirection(): string
    {
        return $this->request->query('sortDirection') === 'asc' ? 'asc' : 'desc';
    }
}
