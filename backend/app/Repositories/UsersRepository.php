<?php

namespace App\Repositories;

use App\Filters\Tests\TestsAccessUsersFilter;
use App\Models\User;
use Illuminate\Support\Collection;

class UsersRepository
{
    public function listAccessUsers(array $filters = [], int $limit = 50): Collection
    {
        $query = User::query()->select(['id', 'name', 'email']);

        (new TestsAccessUsersFilter($filters))->apply($query);

        return $query->orderBy('name')->limit($limit)->get();
    }

    public function listRoleUsers(string $role, array $filters = [], int $limit = 50): Collection
    {
        $query = User::role($role)->select(['id', 'name', 'email']);

        (new TestsAccessUsersFilter($filters))->apply($query);

        return $query->orderBy('name')->limit($limit)->get();
    }

    public function getRoleUserIds(array $userIds, string $role): array
    {
        if (empty($userIds)) {
            return [];
        }

        return User::role($role)
            ->whereIn('id', $userIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }
}
