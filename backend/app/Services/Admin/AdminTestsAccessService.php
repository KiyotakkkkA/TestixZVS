<?php

namespace App\Services\Admin;

use App\Models\Test\Test;
use App\Models\User;
use App\Repositories\TestsRepository;
use App\Services\TestsAccessService;

class AdminTestsAccessService
{
    protected TestsRepository $testsRepository;
    protected TestsAccessService $testsAccessService;
    protected AdminAuditService $auditService;

    public function __construct(
        TestsRepository $testsRepository,
        TestsAccessService $testsAccessService,
        AdminAuditService $auditService
    ) {
        $this->testsRepository = $testsRepository;
        $this->testsAccessService = $testsAccessService;
        $this->auditService = $auditService;
    }

    public function listTests(User $actor, array $filters = []): array
    {
        $sortBy = $filters['sort_by'] ?? 'title';
        $sortDir = $filters['sort_dir'] ?? 'asc';
        $perPage = (int) ($filters['per_page'] ?? 10);
        $page = (int) ($filters['page'] ?? 1);

        $query = Test::query()->with(['accessUsers:id,name,email']);

        if (!$actor->can('tests master access')) {
            $query->where('creator_id', $actor->id);
        }

        $tests = $this->testsRepository->listTests($sortBy, $sortDir, $perPage, $page, $query);

        return [
            'data' => $tests->map(fn (Test $test) => $this->mapTestAccessItem($test))->values()->all(),
            'pagination' => [
                'page' => $tests->currentPage(),
                'per_page' => $tests->perPage(),
                'total' => $tests->total(),
                'last_page' => $tests->lastPage(),
            ],
        ];
    }

    public function updateAccess(User $actor, Test $test, array $payload): array
    {
        $test->load('accessUsers');

        $oldAccessStatus = $this->resolveStatus($test->access_status);
        $oldAccessUsers = $this->mapAccessUsers($test->accessUsers);

        if (array_key_exists('access_status', $payload)) {
            $test->access_status = $payload['access_status'];
            $test->save();
        }

        if (array_key_exists('user_ids', $payload)) {
            $this->testsAccessService->syncAccessUsers($test, $payload['user_ids'] ?? []);
        }

        $test->load('accessUsers');

        $newAccessStatus = $this->resolveStatus($test->access_status);
        $newAccessUsers = $this->mapAccessUsers($test->accessUsers);

        $oldUserIds = collect($oldAccessUsers)->pluck('id')->sort()->values()->all();
        $newUserIds = collect($newAccessUsers)->pluck('id')->sort()->values()->all();

        if ($oldAccessStatus !== $newAccessStatus || $oldUserIds !== $newUserIds) {
            $this->auditService->auditTestAccessUpdated(
                $actor,
                $this->mapTestSnapshot($test),
                [
                    'status' => $oldAccessStatus,
                    'users' => $oldAccessUsers,
                ],
                [
                    'status' => $newAccessStatus,
                    'users' => $newAccessUsers,
                ]
            );
        }

        return $this->mapTestAccessItem($test);
    }

    public function listUsers(array $filters = []): array
    {
        $search = $filters['search'] ?? null;
        $limit = (int) ($filters['limit'] ?? 50);

        $query = User::query()->select(['id', 'name', 'email']);

        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->limit($limit)->get();

        return [
            'data' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])->values()->all(),
        ];
    }

    private function mapTestAccessItem(Test $test): array
    {
        return [
            'id' => $test->id,
            'title' => $test->title,
            'total_questions' => $test->total_questions,
            'total_disabled' => $test->total_disabled,
            'access_status' => $this->resolveStatus($test->access_status),
            'access_users' => $this->mapAccessUsers($test->accessUsers),
        ];
    }

    private function mapAccessUsers($users): array
    {
        return $users->map(fn (User $user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ])->values()->all();
    }

    private function mapTestSnapshot(Test $test): array
    {
        return [
            'id' => $test->id,
            'title' => $test->title,
            'link' => '/workbench/test/' . $test->id,
        ];
    }

    private function resolveStatus($status): ?string
    {
        if (!$status) {
            return null;
        }

        return $status->value ?? (string) $status;
    }
}
