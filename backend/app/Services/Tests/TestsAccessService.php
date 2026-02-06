<?php

namespace App\Services\Tests;

use App\Enum\TestAccessStatus;
use App\Models\Test\Test;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class TestsAccessService
{
    public function applyAccessFilter(Builder $query, ?User $user): Builder
    {
        if (!$user) {
            return $query->where('access_status', TestAccessStatus::ALL->value);
        }

        if ($user->can('tests master access')) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($user) {
            $builder
                ->where('access_status', TestAccessStatus::ALL->value)
                ->orWhere('access_status', TestAccessStatus::AUTH->value)
                ->orWhere(function (Builder $nested) use ($user) {
                    $nested
                        ->where('access_status', TestAccessStatus::PROTECTED->value)
                        ->where(function (Builder $inner) use ($user) {
                            $inner
                                ->where('creator_id', $user->id)
                                ->orWhereExists(function ($subQuery) use ($user) {
                                    $subQuery
                                        ->select(DB::raw(1))
                                        ->from('tests_access')
                                        ->whereColumn('tests_access.test_id', 'tests.id')
                                        ->where('tests_access.user_id', $user->id);
                                });
                        });
                });
        });
    }

    public function syncAccessUsers(Test $test, array $userIds): Test
    {
        $ids = array_values(array_unique(array_map('intval', $userIds)));
        $test->accessUsers()->sync($ids);
        $test->load('accessUsers');

        return $test;
    }
}
