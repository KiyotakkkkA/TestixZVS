<?php

namespace App\Policies;

use App\Models\Test\Test;
use App\Models\User;
use App\Enum\ErrorMessages;
use App\Enum\TestAccessStatus;
use Illuminate\Auth\Access\Response;

class TestPolicy
{
    public function access(?User $user, Test $test): Response
    {
        if ($this->canAccess(auth('sanctum')->user(), $test)) {
            return Response::allow();
        }

        return Response::deny(ErrorMessages::NOT_ALLOWED_TEST_ACCESS->value);
    }

    public function view(User $user, Test $test): Response
    {
        $status = $this->canManage($user, $test);
        if (!$status) {
            return Response::denyAsNotFound(ErrorMessages::RES_NOT_FOUND->value);
        }
        return Response::allow();
    }

    public function create(User $user): Response
    {
        return Response::allow();
    }

    public function update(User $user, Test $test): Response
    {
        $status = $this->canManage($user, $test);
        if (!$status) {
            return Response::deny(ErrorMessages::NOT_ALLOWED_TEST_UPDATE->value);
        }
        return Response::allow();
    }

    public function delete(User $user, Test $test): Response
    {
        $status = $this->canManage($user, $test);
        if (!$status) {
            return Response::denyAsNotFound(ErrorMessages::RES_NOT_FOUND->value);
        }
        return Response::allow();
    }

    public function export(User $user, Test $test): Response
    {
        $status = $this->canManage($user, $test);
        if (!$status) {
            return Response::deny(ErrorMessages::NOT_ALLOWED_TEST_EXPORT->value);
        }
        return Response::allow();
    }

    public function autoFill(User $user, Test $test): Response
    {
        $status = $this->canManage($user, $test);
        if (!$status) {
            return Response::deny(ErrorMessages::NOT_ALLOWED_TEST_AUTOFILL->value);
        }
        return Response::allow();
    }

    private function canManage(User $user, Test $test): bool
    {
        // Тест всегда доступен его создателю и пользователям с мастер-доступом
        return $test->creator_id === $user->id || $user->can('tests master access');
    }

    public function canAccess(?User $user, Test $test): bool
    {
        // Тест доступен всем
        if ($test->access_status === TestAccessStatus::ALL) {
            return true;
        }

        // Всё проверки дальше требуют авторизации, так что в целом нет смысла проверять неавторизованного юзера
        if (!$user) {
            return false;
        }

        // Тест доступен всем авторизованным пользователям
        if ($test->access_status === TestAccessStatus::AUTH) {
            return true;
        }

        // Тест всегда доступен его создателю и пользователям с мастер-доступом
        if ($test->creator_id === $user->id || $user->can('tests master access')) {
            return true;
        }

        // Доступ по ссылке для любого авторизованного пользователя
        if ($test->access_status === TestAccessStatus::LINK) {
            $accessLink = request()->query('access_link');
            if (!$accessLink || !$test->access_link) {
                return false;
            }

            return hash_equals($test->access_link, $accessLink);
        }

        // А иначе проверяем, есть ли у пользователя доступ к этому тесту
        return $test->accessUsers()->where('users.id', $user->id)->exists();
    }
}
