<?php

namespace App\Repositories;

use App\Filters\AuditLogsFilter;
use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuditLogRepository
{
    public function paginate(AuditLogsFilter $filter): LengthAwarePaginator
    {
        $query = AuditLog::query();

        $filter->apply($query);

        if (! $filter->has('sortBy')) {
            $query->latest('created_at');
        }

        return $query->paginate(
            perPage: $filter->perPage(),
            page: $filter->page(),
        );
    }

    public function findByUuid(string $uuid): AuditLog
    {
        return AuditLog::query()->where('uuid', $uuid)->firstOrFail();
    }

    public function create(array $data): AuditLog
    {
        return AuditLog::create($data);
    }
}
