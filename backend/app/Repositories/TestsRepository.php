<?php

namespace App\Repositories;

use App\Models\Test\Test;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class TestsRepository
{
    public function createBlankTest(array $data)
    {
        return Test::create([
            'id' => \Str::uuid()->toString(),
            'creator_id' => auth()->id(),
            'title' => $data['title'],
        ]);
    }

    public function getTestById(string $testId): ?Test
    {
        return Test::with('questions.files')->find($testId);
    }

    public function listTests(string $sortBy = 'title', string $sortDir = 'asc', int $perPage = 10, int $page = 1)
    {
        $query = Test::query();

        if ($sortBy === 'title') {
            $query->orderBy('title', $sortDir);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function updateTest(string $testId, array $payload): array
    {
        return DB::transaction(function () use ($testId, $payload) {
            $test = Test::with('questions')->findOrFail($testId);

            $titleChanged = false;

            if (Arr::has($payload, 'title')) {
                $titleChanged = $test->title !== $payload['title'];
                $test->title = $payload['title'];
            }

            $incoming = collect($payload['questions'] ?? []);
            $existing = $test->questions->keyBy('id');
            $removedIds = collect($payload['removed_question_ids'] ?? [])->map(fn ($id) => (int) $id)->values();

            $changedQuestions = [];

            foreach ($incoming as $item) {
                $normalizedOptions = $this->normalizeOptions($item['options'] ?? []);
                if (!empty($item['id']) && $existing->has((int) $item['id'])) {
                    $question = $existing->get((int) $item['id']);
                    $changed = $this->isQuestionChanged($question->title, $question->disabled, $question->type, $question->options ?? [], $item['title'], $item['disabled'] ?? false, $item['type'], $normalizedOptions);

                    $question->update([
                        'disabled' => $item['disabled'] ?? false,
                        'title' => $item['title'],
                        'type' => $item['type'],
                        'options' => $normalizedOptions,
                    ]);

                    $this->recalculateTotalDisabledQuestions($test);

                    if ($changed) {
                        $changedQuestions[] = [
                            'id' => $question->id,
                            'title' => $question->title,
                            'type' => $question->type,
                            'action' => 'updated',
                            'client_id' => $item['client_id'] ?? null,
                        ];
                    }
                } else {
                    $question = $test->questions()->create([
                        'title' => $item['title'],
                        'type' => $item['type'],
                        'options' => $normalizedOptions,
                    ]);

                    $changedQuestions[] = [
                        'id' => $question->id,
                        'title' => $question->title,
                        'type' => $question->type,
                        'action' => 'added',
                        'client_id' => $item['client_id'] ?? null,
                    ];
                }
            }

            $deletedCount = 0;
            foreach ($removedIds as $removedId) {
                $question = $existing->get((int) $removedId);
                if ($question) {
                    $changedQuestions[] = [
                        'id' => $question->id,
                        'title' => $question->title,
                        'type' => $question->type,
                        'action' => 'removed',
                    ];
                    $question->delete();
                    $deletedCount++;
                }
            }

            $test->total_questions = $test->questions()->count();
            $test->save();

            $test->load('questions.files');

            $hasChanges = $titleChanged || count($changedQuestions) > 0 || $deletedCount > 0;

            return [$test, $changedQuestions, $hasChanges];
        });
    }

    public function appendQuestions(string $testId, array $questions): array
    {
        return DB::transaction(function () use ($testId, $questions) {
            $test = Test::with('questions')->findOrFail($testId);

            $changedQuestions = [];

            foreach ($questions as $item) {
                $normalizedOptions = $this->normalizeOptions($item['options'] ?? []);
                $question = $test->questions()->create([
                    'title' => $item['title'],
                    'type' => $item['type'],
                    'options' => $normalizedOptions,
                ]);

                $changedQuestions[] = [
                    'id' => $question->id,
                    'title' => $question->title,
                    'type' => $question->type,
                    'action' => 'added',
                ];
            }

            $test->total_questions = $test->questions()->count();
            $test->save();
            $test->load('questions.files');

            return [$test, $changedQuestions];
        });
    }

    public function replaceQuestions(string $testId, array $questions): array
    {
        return DB::transaction(function () use ($testId, $questions) {
            $test = Test::with('questions')->findOrFail($testId);

            $changedQuestions = [];
            foreach ($test->questions as $existing) {
                $changedQuestions[] = [
                    'id' => $existing->id,
                    'title' => $existing->title,
                    'type' => $existing->type,
                    'action' => 'removed',
                ];
                $existing->delete();
            }

            foreach ($questions as $item) {
                $normalizedOptions = $this->normalizeOptions($item['options'] ?? []);
                $question = $test->questions()->create([
                    'title' => $item['title'],
                    'type' => $item['type'],
                    'options' => $normalizedOptions,
                ]);

                $changedQuestions[] = [
                    'id' => $question->id,
                    'title' => $question->title,
                    'type' => $question->type,
                    'action' => 'added',
                ];
            }

            $test->total_questions = $test->questions()->count();
            $test->save();
            $test->load('questions.files');

            return [$test, $changedQuestions];
        });
    }

    private function recalculateTotalDisabledQuestions(Test $test): void
    {
        $totalDisabled = $test->questions()->where('disabled', 1)->count();
        $test->total_disabled = $totalDisabled;
        $test->save();
    }

    private function normalizeOptions(?array $options): array
    {
        return [
            'options' => array_values($options['options'] ?? []),
            'correctOptions' => array_values($options['correctOptions'] ?? []),
            'terms' => array_values($options['terms'] ?? []),
            'meanings' => array_values($options['meanings'] ?? []),
            'matches' => array_values($options['matches'] ?? []),
            'answers' => array_values($options['answers'] ?? []),
        ];
    }

    private function isQuestionChanged(
        string $oldTitle,
        string $oldDisabled,
        string $oldType,
        ?array $oldOptions,
        string $newTitle,
        string $newDisabled,
        string $newType,
        array $newOptions
    ): bool {
        if ($oldTitle !== $newTitle || $oldType !== $newType || $oldDisabled !== $newDisabled) {
            return true;
        }

        $normalizedOld = $this->normalizeOptions($oldOptions ?? []);

        return json_encode($normalizedOld) !== json_encode($newOptions);
    }
}
