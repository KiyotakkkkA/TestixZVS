<?php

namespace App\Services\Admin;

use App\Filters\Admin\AdminUsersFilter;
use App\Models\User;
use App\Models\Permission;
use App\Services\Admin\AdminAuditService;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUsersService
{
    private const ROLE_RANKS = [
        'user' => 0,
        'editor' => 1,
        'admin' => 2,
        'root' => 3,
    ];

    protected AdminAuditService $auditService;

    public function __construct(AdminAuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function listUsers(array $filters = []): array
    {
        $page = $filters['page'] ?? 1;
        $perPage = $filters['per_page'] ?? 10;

        $query = User::query()->with(['roles.permissions', 'permissions']);

        (new AdminUsersFilter($filters))->apply($query);

        $paginator = $query->orderBy('id')->paginate($perPage, ['*'], 'page', $page);

        $users = $paginator->getCollection()
            ->map(fn (User $user) => $this->mapUser($user))
            ->values()
            ->all();

        return [
            'data' => $users,
            'pagination' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    public function listRoles(): array
    {
        return Role::query()
            ->with('permissions')
            ->orderBy('name')
            ->get()
            ->map(fn (Role $role) => [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->values()->all(),
            ])
            ->values()
            ->all();
    }

    public function listPermissions(): array
    {
        return Permission::query()
            ->select(['name', 'description'])
            ->orderBy('name')
            ->get()
            ->mapWithKeys(fn (Permission $perm) => [
                $perm->name => [
                    'name' => $perm->name,
                    'description' => $perm->description,
                ],
            ])
            ->all();
    }

    public function updateRoles(User $actor, User $target, array $roles): array
    {
        $this->ensureCanManageTarget($actor, $target);

        $oldRoles = $target->getRoleNames()->values()->all();

        $roles = array_values(array_unique($roles));
        if (count($roles) > 1) {
            abort(422, 'Нельзя назначать более одной роли');
        }

        $roleName = $roles[0] ?? null;
        if ($roleName === 'root' && !$actor->hasRole('root')) {
            abort(403, 'Недостаточно прав для назначения роли root');
        }

        if ($roleName === 'admin' && !$actor->can('assign admin role')) {
            abort(403, 'Недостаточно прав для назначения роли admin');
        }

        if ($roleName === 'teacher' && !$actor->can('assign teacher role')) {
            abort(403, 'Недостаточно прав для назначения роли teacher');
        }

        if ($roleName === 'editor' && !$actor->can('assign editor role')) {
            abort(403, 'Недостаточно прав для назначения роли editor');
        }

        if ($roleName && $this->getRoleRank($roleName) > $this->getUserRank($actor)) {
            abort(403, 'Нельзя назначить роль выше своей');
        }

        $target->syncRoles($roleName ? [$roleName] : []);

        $rolePerms = $roleName ? $this->getRolePermissions($roleName) : [];
        $target->syncPermissions($rolePerms);

        $newRoles = $target->getRoleNames()->values()->all();
        $this->auditService->auditAdminRolesChange($actor, $target, $oldRoles, $newRoles);

        return $this->mapUser($target);
    }

    public function updatePermissions(User $actor, User $target, array $perms): array
    {
        $this->ensureCanManageTarget($actor, $target);

        if (!$actor->can('assign permissions')) {
            abort(403, 'Недостаточно прав для назначения прав');
        }

        $actorPerms = $actor->getAllPermissions()->pluck('name')->values()->all();
        $perms = array_values(array_unique($perms));
        $invalid = array_diff($perms, $actorPerms);
        if (!empty($invalid)) {
            abort(403, 'Нельзя назначать права, которых нет у вас');
        }

        $oldPerms = $target->getAllPermissions()->pluck('name')->values()->all();

        $target->syncPermissions($perms);

        $newPerms = $target->getAllPermissions()->pluck('name')->values()->all();
        $this->auditService->auditAdminPermissionsChange($actor, $target, $oldPerms, $newPerms);

        return $this->mapUser($target);
    }

    public function createUser(User $actor, array $data): array
    {
        if (!$actor->can('add users')) {
            abort(403, 'Недостаточно прав для добавления пользователей');
        }

        $roleName = $data['role'] ?? 'user';
        $roleName = $roleName ?: 'user';

        if ($roleName === 'root' && !$actor->hasRole('root')) {
            abort(403, 'Недостаточно прав для назначения роли root');
        }

        if ($roleName === 'admin' && !$actor->can('assign admin role')) {
            abort(403, 'Недостаточно прав для назначения роли admin');
        }

        if ($roleName === 'editor' && !$actor->can('assign editor role')) {
            abort(403, 'Недостаточно прав для назначения роли editor');
        }

        if ($this->getRoleRank($roleName) > $this->getUserRank($actor)) {
            abort(403, 'Нельзя назначить роль выше своей');
        }

        $user = User::create([
            'registered_by' => $actor->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->syncRoles($roleName ? [$roleName] : []);
        $rolePerms = $roleName ? $this->getRolePermissions($roleName) : [];
        $user->syncPermissions($rolePerms);

        $this->auditService->auditAdminUserAdd(
            $actor,
            $user,
            $user->getRoleNames()->values()->all(),
            $user->getAllPermissions()->pluck('name')->values()->all()
        );

        return $this->mapUser($user);
    }

    public function deleteUser(User $actor, User $target): void
    {
        if (!$actor->can('remove users')) {
            abort(403, 'Недостаточно прав для удаления пользователей');
        }

        $this->ensureCanManageTarget($actor, $target);

        if ($target->hasRole('root') && !$actor->hasRole('root')) {
            abort(403, 'Недостаточно прав для удаления пользователя root');
        }

        if ($target->hasRole('admin') && !$actor->can('assign admin role')) {
            abort(403, 'Недостаточно прав для удаления администратора');
        }

        if ($target->hasRole('editor') && !$actor->can('assign editor role')) {
            abort(403, 'Недостаточно прав для удаления редактора');
        }

        $roles = $target->getRoleNames()->values()->all();
        $perms = $target->getAllPermissions()->pluck('name')->values()->all();
        $this->auditService->auditAdminUserRemove($actor, $target, $roles, $perms);

        $target->delete();
    }

    private function ensureCanManageTarget(User $actor, User $target): void
    {
        if ($actor->id === $target->id) {
            abort(403, 'Нельзя изменять свои роли и права');
        }

        if ($this->getUserRank($actor) < $this->getUserRank($target)) {
            abort(403, 'Нельзя управлять пользователем выше по роли');
        }
    }

    private function mapUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'roles' => $user->getRoleNames()->values()->all(),
            'perms' => $user->getAllPermissions()->pluck('name')->values()->all(),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    private function getRoleRank(string $roleName): int
    {
        return self::ROLE_RANKS[$roleName] ?? -1;
    }

    private function getUserRank(User $user): int
    {
        $roles = $user->getRoleNames()->values()->all();
        $ranks = array_map(fn (string $role) => $this->getRoleRank($role), $roles);
        return $ranks ? max($ranks) : -1;
    }

    private function getRolePermissions(string $roleName): array
    {
        $role = Role::query()->where('name', $roleName)->first();
        if (!$role) {
            return [];
        }
        return $role->permissions->pluck('name')->values()->all();
    }
}
