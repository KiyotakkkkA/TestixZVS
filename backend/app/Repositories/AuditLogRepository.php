<?php

namespace App\Repositories;

use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuditLogRepository
{
    public function paginate(int $page, int $perPage): LengthAwarePaginator
    {
        return AuditLog::query()
            ->latest('created_at')
            ->paginate(perPage: $perPage, page: $page);
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
