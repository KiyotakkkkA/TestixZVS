<?php

namespace App\Services\Tests;

use App\Exceptions\ApiException;
use App\Repositories\TestsRepository;
use App\Models\Test\Test;
use App\Services\Admin\AdminAuditService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class TestsService
{
    protected TestsRepository $testsRepository;
    protected AdminAuditService $auditService;
    protected TestsAccessService $testsAccessService;

    public function __construct(
        TestsRepository $testsRepository,
        AdminAuditService $auditService,
        TestsAccessService $testsAccessService
    )
    {
        $this->testsRepository = $testsRepository;
        $this->auditService = $auditService;
        $this->testsAccessService = $testsAccessService;
    }

    public function createBlankTest(array $data)
    {
        $test = $this->testsRepository->createBlankTest($data);
        $this->auditService->auditTestCreated(auth()->user(), $this->mapTestSnapshot($test));

        return $test;
    }

    public function getTestById(string $testId): ?Test
    {
        return $this->testsRepository->getTestById($testId);
    }

    public function listTests(string $sortBy = 'title', string $sortDir = 'asc', int $perPage = 10, int $page = 1)
    {
        $query = Test::query();
        $this->testsAccessService->applyAccessFilter($query, auth('sanctum')->user());

        return $this->testsRepository->listTests($sortBy, $sortDir, $perPage, $page, $query);
    }

    public function updateTest(string $testId, array $payload): array
    {
        [$test, $changedQuestions, $hasChanges] = $this->testsRepository->updateTest($testId, $payload);

        if ($hasChanges) {
            $this->auditService->auditTestUpdated(auth()->user(), $this->mapTestSnapshot($test), $changedQuestions);
        }

        return [$test, $changedQuestions];
    }

    public function getPublicTestPayload(string $testId): ?array
    {
        $test = $this->testsRepository->getTestById($testId);
        if (!$test) {
            return null;
        }

        $alphabet = range('A', 'Z');

        $questions = $test->nonDisabledQuestions->map(function ($question) use ($alphabet) {
            $options = $question->options ?? [];
            $files = $question->files->map(fn ($file) => [
                'id' => $file->id,
                'name' => $file->name,
                'alias' => $file->alias,
                'mime_type' => $file->mime_type,
                'size' => $file->size,
                'url' => Storage::disk('public')->url($file->alias),
            ])->values()->all();

            if ($question->type === 'single' || $question->type === 'multiple') {
                return [
                    'id' => $question->id,
                    'question' => $question->title,
                    'type' => $question->type,
                    'options' => array_values($options['options'] ?? []),
                    'correctAnswers' => array_values($options['correctOptions'] ?? []),
                    'files' => $files,
                ];
            }

            if ($question->type === 'matching') {
                $terms = array_values($options['terms'] ?? []);
                $meanings = array_values($options['meanings'] ?? []);
                $matches = array_values($options['matches'] ?? []);

                $termsMap = [];
                foreach ($terms as $index => $term) {
                    $key = $alphabet[$index] ?? (string) ($index + 1);
                    $termsMap[$key] = $term;
                }

                $meaningsMap = [];
                foreach ($meanings as $index => $meaning) {
                    $meaningsMap[$index] = $meaning;
                }

                $correct = [];
                foreach ($matches as $index => $termKey) {
                    if (!empty($termKey)) {
                        $correct[] = $termKey . $index;
                    }
                }

                return [
                    'id' => $question->id,
                    'question' => $question->title,
                    'type' => $question->type,
                    'terms' => $termsMap,
                    'meanings' => $meaningsMap,
                    'correctAnswers' => $correct,
                    'files' => $files,
                ];
            }

            return [
                'id' => $question->id,
                'question' => $question->title,
                'type' => $question->type,
                'correctAnswers' => array_values($options['answers'] ?? []),
                'files' => $files,
            ];
        })->values()->all();

        return [
            'id' => $test->id,
            'title' => $test->title,
            'total_questions' => $test->total_questions,
            'total_disabled' => $test->total_disabled, 
            'is_current_user_creator' => $test->is_current_user_creator,
            'questions' => $questions,
        ];
    }

    public function deleteTest(string $testId): bool
    {
        $test = $this->testsRepository->getTestById($testId);
        if (!$test) {
            return false;
        }

        $snapshot = $this->mapTestSnapshot($test);
        $test->delete();
        $this->auditService->auditTestDeleted(auth()->user(), $snapshot);

        return true;
    }

    public function autoFillFromJson(string $testId, array $payload): array
    {
        $questions = $payload['questions'] ?? [];
        $selectedIndexes = $payload['selectedIndexes'] ?? [];
        $replace = (bool) ($payload['replace'] ?? false);

        $selected = $this->selectQuestions($questions, $selectedIndexes);
        if (count($selected) === 0) {
            throw new ApiException('Не удалось выбрать вопросы для импорта.', 422);
        }

        $normalized = [];
        foreach ($selected as $item) {
            $normalized[] = $this->mapJsonQuestionToPayload($item);
        }

        if ($replace) {
            throw new ApiException('Замена вопросов временно недоступна.', 409);
            # [$test, $changedQuestions] = $this->testsRepository->replaceQuestions($testId, $normalized);
        } else {
            [$test, $changedQuestions] = $this->testsRepository->appendQuestions($testId, $normalized);
        }

        if (count($changedQuestions) > 0) {
            $this->auditService->auditTestUpdated(auth()->user(), $this->mapTestSnapshot($test), $changedQuestions);
        }

        return [$test, $changedQuestions];
    }

    private function selectQuestions(array $questions, array $selectedIndexes): array
    {
        if (empty($selectedIndexes)) {
            return $questions;
        }

        $total = count($questions);
        $selected = [];

        foreach ($selectedIndexes as $index) {
            $idx = (int) $index;
            if ($idx < 1 || $idx > $total) {
                continue;
            }
            $selected[] = $questions[$idx - 1];
        }

        return $selected;
    }

    private function mapJsonQuestionToPayload(array $question): array
    {
        $type = $question['type'] ?? 'single';
        $title = $question['question'] ?? $question['title'] ?? '';

        if (!$title) {
            throw new ApiException('Вопрос без текста не может быть импортирован.', 422);
        }

        if ($type === 'single' || $type === 'multiple') {
            $options = array_values($question['options'] ?? []);
            $correct = array_values($question['correctAnswers'] ?? []);
            $correct = array_map('intval', $correct);

            return [
                'title' => $title,
                'type' => $type,
                'options' => [
                    'options' => $options,
                    'correctOptions' => $correct,
                ],
            ];
        }

        if ($type === 'matching') {
            [$terms, $termKeys] = $this->normalizeMapList($question['terms'] ?? [], false);
            [$meanings, $meaningKeys] = $this->normalizeMapList($question['meanings'] ?? [], true);

            $correctAnswers = array_values($question['correctAnswers'] ?? []);
            $correctMap = [];
            foreach ($correctAnswers as $pair) {
                if (!is_string($pair)) {
                    continue;
                }
                $termKey = substr($pair, 0, 1);
                $meaningIndex = substr($pair, 1);
                if ($termKey === '' || $meaningIndex === '') {
                    continue;
                }
                $correctMap[(string) $meaningIndex] = $termKey;
            }

            $matches = [];
            foreach ($meaningKeys as $key) {
                $matches[] = $correctMap[(string) $key] ?? '';
            }

            return [
                'title' => $title,
                'type' => $type,
                'options' => [
                    'terms' => $terms,
                    'meanings' => $meanings,
                    'matches' => $matches,
                ],
            ];
        }

        if ($type === 'full_answer') {
            $answers = array_values($question['correctAnswers'] ?? []);
            $answers = array_map('strval', $answers);

            return [
                'title' => $title,
                'type' => $type,
                'options' => [
                    'answers' => $answers,
                ],
            ];
        }

        throw new ApiException('Неподдерживаемый тип вопроса: ' . $type, 422);
    }

    private function normalizeMapList($value, bool $numericKeys): array
    {
        if (!is_array($value)) {
            return [[], []];
        }

        if (array_is_list($value)) {
            $keys = array_keys($value);
            return [array_values($value), $keys];
        }

        $items = $value;
        if ($numericKeys) {
            ksort($items, SORT_NUMERIC);
        } else {
            ksort($items, SORT_NATURAL | SORT_FLAG_CASE);
        }

        return [array_values($items), array_keys($items)];
    }

    private function mapTestSnapshot(Test $test): array
    {
        return [
            'id' => $test->id,
            'title' => $test->title,
            'link' => '/workbench/test/' . $test->id,
        ];
    }
}
