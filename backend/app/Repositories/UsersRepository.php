<?php

namespace App\Repositories;

use App\Enum\UserStatuses;
use App\Filters\UsersFilter;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class UsersRepository
{
    public function paginate(UsersFilter $filter): LengthAwarePaginator
    {
        $query = User::query()->with('roles');

        $filter->apply($query);

        if (! $filter->has('sortBy')) {
            $query->orderBy('name');
        }

        return $query->paginate(
            perPage: $filter->perPage(),
            page: $filter->page(),
        );
    }

    public function create(array $data): User
    {
        return User::create([
            'name' => 'Пользователь@'.Str::random(12),
            'email' => $data['email'],
            'password' => $data['password'],
            'status' => UserStatuses::ACTIVE,
            'email_verified_at' => now(),
        ]);
    }
}
