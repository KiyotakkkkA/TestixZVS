<?php

namespace App\Services;

use App\Filters\UsersFilter;
use App\Models\User;
use App\Repositories\UsersRepository;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class AdminUsersService
{
    private const AVAILABLE_PERMISSIONS = [
        'tests.view',
        'tests.edit',
        'tests.access',
        'tests.master',
        'users.view',
        'users.edit',
        'users.access',
    ];

    public function __construct(
        private UsersRepository $usersRepository,
        private AuditLogService $auditLogService,
    ) {}

    public function index(UsersFilter $filter): array
    {
        $users = $this->usersRepository->paginate($filter);

        return [
            'status' => 200,
            'data' => [
                'data' => $users
                    ->getCollection()
                    ->map(fn (User $user): array => $this->serializeUser($user))
                    ->values()
                    ->all(),
                'meta' => [
                    'currentPage' => $users->currentPage(),
                    'perPage' => $users->perPage(),
                    'total' => $users->total(),
                    'lastPage' => $users->lastPage(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ],
            ],
        ];
    }

    public function store(array $data, ?User $author = null, ?Request $request = null): array
    {
        $user = $this->usersRepository->create($data);
        $user->assignRole('user');

        $serializedUser = $this->serializeUser($user);

        $this->auditLogService->recordUserCreated(
            createdUser: $user,
            createdUserSnapshot: $serializedUser,
            author: $author,
            request: $request,
        );

        return [
            'status' => 201,
            'data' => $serializedUser,
        ];
    }

    public function accessChange(array $data, ?User $author = null, ?Request $request = null): array
    {
        $permissions = collect($data['permissions'] ?? [])
            ->intersect(self::AVAILABLE_PERMISSIONS)
            ->values()
            ->all();

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $user = $this->usersRepository->findById((int) $data['userId']);
        $oldPermissions = $user->getAllPermissions()->pluck('name')->values()->all();

        $user = $this->usersRepository->syncPermissions(
            $user,
            $permissions,
        );

        $this->auditLogService->recordUserAccessChanged(
            targetUser: $user,
            oldPermissions: $oldPermissions,
            newPermissions: $permissions,
            author: $author,
            request: $request,
        );

        return [
            'status' => 200,
            'data' => $this->serializeUser($user),
        ];
    }

    private function serializeUser(User $user): array
    {
        $roles = $user->getRoleNames()->values()->all();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $roles[0] ?? 'user',
            'roles' => $roles,
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
            'status' => $user->status->value,
        ];
    }
}
