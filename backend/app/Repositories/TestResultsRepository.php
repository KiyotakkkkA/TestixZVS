<?php

namespace App\Repositories;

use App\Models\Test;
use App\Models\TestResult;
use App\Models\User;

class TestResultsRepository
{
    public function findCurrent(Test $test, User $user): ?TestResult
    {
        return TestResult::query()
            ->where('test_id', $test->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->latest('updated_at')
            ->first();
    }

    public function findLatest(Test $test, User $user): ?TestResult
    {
        return TestResult::query()
            ->where('test_id', $test->id)
            ->where('user_id', $user->id)
            ->latest('updated_at')
            ->first();
    }

    public function create(array $data): TestResult
    {
        return TestResult::create($data);
    }

    public function update(TestResult $result, array $data): TestResult
    {
        $result->update($data);

        return $result->refresh();
    }
}
