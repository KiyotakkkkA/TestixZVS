<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;

class AuditLogsFilter extends QueryFilter
{
    private const MIN_PER_PAGE = 5;

    private const MAX_PER_PAGE = 100;

    private const EVENT_TYPES = ['all', 'created', 'updated', 'deleted', 'access'];

    private const ENTITY_TYPES = ['all', 'user', 'test', 'role'];

    private const SORT_COLUMNS = [
        'createdAt' => 'created_at',
        'eventType' => 'event_type',
        'entityType' => 'entity_type',
        'author' => 'author_name',
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
                ->where('summary', 'like', "%{$normalizedSearch}%")
                ->orWhere('entity_label', 'like', "%{$normalizedSearch}%")
                ->orWhere('author_name', 'like', "%{$normalizedSearch}%")
                ->orWhere('author_email', 'like', "%{$normalizedSearch}%")
                ->orWhere('uuid', 'like', "%{$normalizedSearch}%");
        });
    }

    public function eventType(Builder $builder, string $eventType): void
    {
        if (! in_array($eventType, self::EVENT_TYPES, true) || $eventType === 'all') {
            return;
        }

        $builder->where('event_type', $eventType);
    }

    public function entityType(Builder $builder, string $entityType): void
    {
        if (! in_array($entityType, self::ENTITY_TYPES, true) || $entityType === 'all') {
            return;
        }

        $builder->where('entity_type', $entityType);
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
        $perPage = (int) $this->request->query('perPage', 10);

        return min(max($perPage, self::MIN_PER_PAGE), self::MAX_PER_PAGE);
    }

    private function sortDirection(): string
    {
        return $this->request->query('sortDirection') === 'asc' ? 'asc' : 'desc';
    }
}
