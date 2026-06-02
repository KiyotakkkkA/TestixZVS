<?php

namespace App\Repositories;

use App\Models\Test;
use App\Models\TestQuestion;

class TestQuestionsRepository
{
    public function create(Test $test, array $data): TestQuestion
    {
        return $test->questions()->create([
            ...$data,
            'position' => $this->nextPosition($test),
        ]);
    }

    public function update(TestQuestion $question, array $data): TestQuestion
    {
        $question->update($data);

        return $question->refresh();
    }

    public function delete(TestQuestion $question): void
    {
        $test = $question->test;

        $question->delete();

        $this->normalizePositions($test);
    }

    private function nextPosition(Test $test): int
    {
        return ((int) $test->questions()->max('position')) + 1;
    }

    private function normalizePositions(Test $test): void
    {
        $test->questions()
            ->orderBy('position')
            ->get()
            ->values()
            ->each(function (TestQuestion $question, int $index): void {
                $question->update(['position' => $index + 1]);
            });
    }
}
