<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GroupPolicy
{
    public function update(User $user, Group $group): Response
    {
        if ($group->created_by !== $user->id) {
            return Response::deny('Недостаточно прав для изменения группы.');
        }

        return Response::allow();
    }

    public function delete(User $user, Group $group): Response
    {
        if ($group->created_by !== $user->id) {
            return Response::deny('Недостаточно прав для удаления группы.');
        }

        return Response::allow();
    }
}
