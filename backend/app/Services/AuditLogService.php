<?php

namespace App\Services;

use App\Filters\AuditLogsFilter;
use App\Models\AuditLog;
use App\Models\User;
use App\Repositories\AuditLogRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuditLogService
{
    public function __construct(private AuditLogRepository $auditLogRepository) {}

    public function index(AuditLogsFilter $filter): array
    {
        $logs = $this->auditLogRepository->paginate($filter);

        return [
            'status' => 200,
            'data' => [
                'data' => $logs
                    ->getCollection()
                    ->map(fn (AuditLog $log): array => $this->serializeListItem($log))
                    ->values()
                    ->all(),
                'meta' => [
                    'currentPage' => $logs->currentPage(),
                    'perPage' => $logs->perPage(),
                    'total' => $logs->total(),
                    'lastPage' => $logs->lastPage(),
                    'from' => $logs->firstItem(),
                    'to' => $logs->lastItem(),
                ],
            ],
        ];
    }

    public function show(string $uuid): array
    {
        return [
            'status' => 200,
            'data' => $this->serializeDetails($this->auditLogRepository->findByUuid($uuid)),
        ];
    }

    public function record(
        string $eventType,
        string $entityType,
        ?int $entityId,
        ?string $entityLabel,
        ?User $author,
        string $summary,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null,
        ?Request $request = null,
    ): AuditLog {
        return $this->auditLogRepository->create([
            'uuid' => (string) Str::uuid(),
            'event_type' => $eventType,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'entity_label' => $entityLabel,
            'author_id' => $author?->id,
            'author_name' => $author?->name,
            'author_email' => $author?->email,
            'summary' => $summary,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    public function recordUserCreated(
        User $createdUser,
        array $createdUserSnapshot,
        ?User $author,
        ?Request $request = null,
    ): AuditLog {
        return $this->record(
            eventType: 'created',
            entityType: 'user',
            entityId: $createdUser->id,
            entityLabel: $createdUser->email,
            author: $author,
            summary: "Создан пользователь {$createdUser->email}",
            newValues: $createdUserSnapshot,
            metadata: [
                'role' => $createdUserSnapshot['role'] ?? null,
                'status' => $createdUserSnapshot['status'] ?? null,
            ],
            request: $request,
        );
    }

    public function recordUserAccessChanged(
        User $targetUser,
        array $oldPermissions,
        array $newPermissions,
        ?User $author,
        ?Request $request = null,
    ): AuditLog {
        return $this->record(
            eventType: 'access',
            entityType: 'user',
            entityId: $targetUser->id,
            entityLabel: $targetUser->email,
            author: $author,
            summary: "Изменены права пользователя {$targetUser->email}",
            oldValues: [
                'permissions' => array_values($oldPermissions),
            ],
            newValues: [
                'permissions' => array_values($newPermissions),
            ],
            metadata: [
                'role' => $targetUser->getRoleNames()->first(),
                'addedPermissions' => array_values(array_diff($newPermissions, $oldPermissions)),
                'removedPermissions' => array_values(array_diff($oldPermissions, $newPermissions)),
            ],
            request: $request,
        );
    }

    private function serializeListItem(AuditLog $log): array
    {
        return [
            'uuid' => $log->uuid,
            'eventType' => $log->event_type,
            'eventLabel' => $log->event_label,
            'entityType' => $log->entity_type,
            'entityLabel' => $log->entity_label,
            'entityLabelHuman' => $log->entity_label_human,
            'authorName' => $log->author_name,
            'authorEmail' => $log->author_email,
            'summary' => $log->summary,
            'createdAt' => $log->created_at?->toISOString(),
        ];
    }

    private function serializeDetails(AuditLog $log): array
    {
        return [
            ...$this->serializeListItem($log),
            'entityId' => $log->entity_id,
            'authorId' => $log->author_id,
            'oldValues' => $log->old_values ?? [],
            'newValues' => $log->new_values ?? [],
            'metadata' => $log->metadata ?? [],
            'ipAddress' => $log->ip_address,
            'userAgent' => $log->user_agent,
        ];
    }
}
