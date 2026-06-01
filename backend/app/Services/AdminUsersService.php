<?php

namespace App\Services;

use App\Filters\UsersFilter;
use App\Models\User;
use App\Repositories\UsersRepository;

class AdminUsersService
{
    public function __construct(private UsersRepository $usersRepository) {}

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

    public function store(array $data): array
    {
        $user = $this->usersRepository->create($data);
        $user->assignRole('user');

        return [
            'status' => 201,
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
            'status' => $user->status->value,
        ];
    }
}
