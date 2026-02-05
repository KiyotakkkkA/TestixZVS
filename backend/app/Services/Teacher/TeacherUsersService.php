<?php

namespace App\Services\Teacher;

use App\Models\Group;
use App\Models\User;
use Spatie\Permission\Models\Role;
use App\Repositories\GroupsRepository;
use App\Repositories\UsersRepository;
use Illuminate\Support\Facades\Hash;

class TeacherUsersService
{
    protected GroupsRepository $groupsRepository;
    protected UsersRepository $usersRepository;

    public function __construct(GroupsRepository $groupsRepository, UsersRepository $usersRepository)
    {
        $this->groupsRepository = $groupsRepository;
        $this->usersRepository = $usersRepository;
    }

    public function listGroups(User $actor, array $filters = []): array
    {
        $paginator = $this->groupsRepository->listByCreator($actor, $filters);

        $groups = $paginator->getCollection()
            ->map(fn (Group $group) => $this->mapGroup($group))
            ->values()
            ->all();

        return [
            'data' => $groups,
            'pagination' => [
                'page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    public function createGroup(User $actor, array $payload): array
    {
        $userIds = $payload['user_ids'] ?? [];
        $validUserIds = $this->usersRepository->getRoleUserIds($userIds, 'user');

        $this->ensureAllUserIdsValid($userIds, $validUserIds);

        $group = $this->groupsRepository->createGroup($actor, $payload['name'], $validUserIds);

        return $this->mapGroup($group);
    }

    public function updateName(Group $group, string $name): array
    {
        $group = $this->groupsRepository->updateName($group, $name);

        return $this->mapGroup($group);
    }

    public function addParticipants(Group $group, array $userIds): array
    {
        $validUserIds = $this->usersRepository->getRoleUserIds($userIds, 'user');

        $this->ensureAllUserIdsValid($userIds, $validUserIds);

        $group = $this->groupsRepository->addParticipants($group, $validUserIds);

        return $this->mapGroup($group);
    }

    public function removeParticipant(Group $group, int $userId): array
    {
        $group = $this->groupsRepository->removeParticipant($group, $userId);

        return $this->mapGroup($group);
    }

    public function deleteGroup(Group $group): void
    {
        $this->groupsRepository->deleteGroup($group);
    }

    public function listUsers(array $filters = []): array
    {
        $limit = (int) ($filters['limit'] ?? 50);

        $users = $this->usersRepository->listRoleUsers('user', $filters, $limit);

        return [
            'data' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])->values()->all(),
        ];
    }

    public function createUser(User $actor, array $payload): array
    {
        if (!$actor->can('add users') && !$actor->hasRole('teacher')) {
            abort(403, 'Недостаточно прав для регистрации пользователей');
        }

        $user = User::create([
            'registered_by' => $actor->id,
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => Hash::make($payload['password']),
        ]);

        if (Role::where('name', 'user')->exists()) {
            $user->assignRole('user');
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }

    private function ensureAllUserIdsValid(array $requestedIds, array $validIds): void
    {
        $requested = collect($requestedIds)->map(fn ($id) => (int) $id)->values();
        $valid = collect($validIds)->map(fn ($id) => (int) $id)->values();

        $missing = $requested->diff($valid);
        if ($missing->isNotEmpty()) {
            abort(422, 'Список пользователей содержит недопустимые значения');
        }
    }

    private function mapGroup(Group $group): array
    {
        $participants = $group->participants
            ->sortBy('name')
            ->values()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->all();

        return [
            'id' => $group->id,
            'name' => $group->name,
            'created_by' => $group->created_by,
            'created_at' => $group->created_at,
            'updated_at' => $group->updated_at,
            'participants' => $participants,
            'participants_count' => count($participants),
        ];
    }
}
