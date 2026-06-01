<?php

namespace App\Filters;

use App\Enum\UserStatuses;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role;

class UsersFilter extends QueryFilter
{
    private const MIN_PER_PAGE = 5;

    private const MAX_PER_PAGE = 100;

    private const SORT_COLUMNS = [
        'name' => 'users.name',
        'email' => 'users.email',
        'status' => 'users.status',
        'createdAt' => 'users.created_at',
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
                ->where('users.name', 'like', "%{$normalizedSearch}%")
                ->orWhere('users.email', 'like', "%{$normalizedSearch}%");
        });
    }

    public function status(Builder $builder, string $status): void
    {
        if ($status === 'all' || UserStatuses::tryFrom($status) === null) {
            return;
        }

        $builder->where('users.status', $status);
    }

    public function role(Builder $builder, string $role): void
    {
        if ($role === 'all') {
            return;
        }

        $builder->whereHas('roles', static function (Builder $query) use ($role): void {
            $query->where('name', $role);
        });
    }

    public function sortBy(Builder $builder, string $sortBy): void
    {
        if ($sortBy === 'role') {
            $this->sortByRole($builder);

            return;
        }

        $column = self::SORT_COLUMNS[$sortBy] ?? self::SORT_COLUMNS['name'];
        $builder->orderBy($column, $this->sortDirection());
    }

    private function sortByRole(Builder $builder): void
    {
        $builder->orderBy(
            Role::query()
                ->select('roles.name')
                ->join('model_has_roles', 'model_has_roles.role_id', '=', 'roles.id')
                ->whereColumn('model_has_roles.model_id', 'users.id')
                ->where('model_has_roles.model_type', 'App\\Models\\User')
                ->limit(1),
            $this->sortDirection(),
        );
    }

    private function sortDirection(): string
    {
        return $this->request->query('sortDirection') === 'desc' ? 'desc' : 'asc';
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
}
