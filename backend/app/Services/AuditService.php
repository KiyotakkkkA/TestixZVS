<?php

namespace App\Services;

use App\Models\Audit;
use App\Models\User;

class AuditService
{
    public const ACTION_ADMIN_ROLES_CHANGE = 'admin_roles_change';
    public const ACTION_ADMIN_PERMISSIONS_CHANGE = 'admin_permissions_change';
    public const ACTION_ADMIN_USER_ADD = 'admin_user_add';
    public const ACTION_ADMIN_USER_REMOVE = 'admin_user_remove';

    public function auditAdminRolesChange(User $actor, User $target, array $oldRoles, array $newRoles): void
    {
        $this->storeAudit(
            $actor,
            self::ACTION_ADMIN_ROLES_CHANGE,
            [
                'user' => $this->mapUserSnapshot($target),
                'roles' => array_values($oldRoles),
            ],
            [
                'user' => $this->mapUserSnapshot($target),
                'roles' => array_values($newRoles),
            ],
            'Изменение ролей пользователя'
        );
    }

    public function auditAdminPermissionsChange(User $actor, User $target, array $oldPerms, array $newPerms): void
    {
        $this->storeAudit(
            $actor,
            self::ACTION_ADMIN_PERMISSIONS_CHANGE,
            [
                'user' => $this->mapUserSnapshot($target),
                'permissions' => array_values($oldPerms),
            ],
            [
                'user' => $this->mapUserSnapshot($target),
                'permissions' => array_values($newPerms),
            ],
            'Изменение прав пользователя'
        );
    }

    public function auditAdminUserAdd(User $actor, User $createdUser, array $roles, array $perms): void
    {
        $this->storeAudit(
            $actor,
            self::ACTION_ADMIN_USER_ADD,
            null,
            [
                'user' => $this->mapUserSnapshot($createdUser),
                'roles' => array_values($roles),
                'permissions' => array_values($perms),
            ],
            'Добавление пользователя'
        );
    }

    public function auditAdminUserRemove(User $actor, User $removedUser, array $roles, array $perms): void
    {
        $this->storeAudit(
            $actor,
            self::ACTION_ADMIN_USER_REMOVE,
            [
                'user' => $this->mapUserSnapshot($removedUser),
                'roles' => array_values($roles),
                'permissions' => array_values($perms),
            ],
            null,
            'Удаление пользователя'
        );
    }

    private function storeAudit(User $actor, string $actionType, ?array $oldState, ?array $newState, ?string $comment = null): void
    {
        Audit::create([
            'user_id' => $actor->id,
            'action_type' => $actionType,
            'old_object_state' => $oldState,
            'new_object_state' => $newState,
            'comment' => $comment,
        ]);
    }

    private function mapUserSnapshot(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
