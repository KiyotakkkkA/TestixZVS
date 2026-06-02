<?php

namespace App\Services;

use App\Filters\TestsFilter;
use App\Models\Test;
use App\Models\TestQuestion;
use App\Models\User;
use App\Repositories\TestQuestionsRepository;
use App\Repositories\TestsRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TestsService
{
    public function __construct(
        private TestsRepository $testsRepository,
        private TestQuestionsRepository $testQuestionsRepository,
        private AuditLogService $auditLogService,
    ) {}

    public function index(TestsFilter $filter): array
    {
        $tests = $this->testsRepository->paginate($filter);

        return [
            'status' => 200,
            'data' => [
                'data' => $tests
                    ->getCollection()
                    ->map(fn (Test $test): array => $this->serializeTest($test))
                    ->values()
                    ->all(),
                'meta' => [
                    'currentPage' => $tests->currentPage(),
                    'perPage' => $tests->perPage(),
                    'total' => $tests->total(),
                    'lastPage' => $tests->lastPage(),
                    'from' => $tests->firstItem(),
                    'to' => $tests->lastItem(),
                ],
            ],
        ];
    }

    public function store(array $data, User $author, ?Request $request = null): array
    {
        $test = $this->testsRepository->create([
            'id' => (string) Str::uuid(),
            'author_id' => (string) $author->id,
            'title' => $data['title'],
            'description' => $data['description'],
            'estimated_pass_time_int' => $data['estimatedPassTime'],
        ]);

        $serializedTest = $this->serializeTest($test);

        $this->auditLogService->recordTestCreated(
            createdTest: $test,
            createdTestSnapshot: $serializedTest,
            author: $author,
            request: $request,
        );

        return [
            'status' => 201,
            'data' => $serializedTest,
        ];
    }

    public function show(string $id): array
    {
        return [
            'status' => 200,
            'data' => $this->serializeTestDetails(
                $this->testsRepository->findWithQuestions($id),
            ),
        ];
    }

    public function storeQuestion(Test $test, array $data): array
    {
        $question = $this->testQuestionsRepository->create($test, [
            'id' => (string) Str::uuid(),
            ...$this->normalizeQuestionData($data),
        ]);

        return [
            'status' => 201,
            'data' => $this->serializeQuestion($question),
        ];
    }

    public function updateQuestion(Test $test, TestQuestion $question, array $data): array
    {
        $this->ensureQuestionBelongsToTest($test, $question);

        $question = $this->testQuestionsRepository->update(
            $question,
            $this->normalizeQuestionData($data),
        );

        return [
            'status' => 200,
            'data' => $this->serializeQuestion($question),
        ];
    }

    public function deleteQuestion(Test $test, TestQuestion $question): array
    {
        $this->ensureQuestionBelongsToTest($test, $question);

        $this->testQuestionsRepository->delete($question);

        return [
            'status' => 200,
            'data' => ['message' => 'Вопрос удалён.'],
        ];
    }

    private function serializeTest(Test $test): array
    {
        $questionsCount = $test->relationLoaded('questions')
            ? $test->questions->count()
            : $test->questions()->count();

        return [
            'id' => $test->id,
            'authorId' => $test->author_id,
            'title' => $test->title,
            'description' => $test->description,
            'questionsCount' => $questionsCount,
            'duration' => $test->estimated_pass_time_int,
            'rating' => 0,
            'passedCount' => 0,
            'createdAt' => $test->created_at?->toDateString(),
            'icon' => 'mdi:clipboard-text-outline',
        ];
    }

    private function serializeTestDetails(Test $test): array
    {
        return [
            'id' => $test->id,
            'authorId' => $test->author_id,
            'title' => $test->title,
            'description' => $test->description,
            'questions' => $test->questions
                ->map(fn (TestQuestion $question): array => $this->serializeQuestion($question))
                ->values()
                ->all(),
            'estimatedPassTime' => $test->estimated_pass_time_int,
            'rating' => 0,
            'passedCount' => 0,
            'createdAt' => $test->created_at?->toISOString(),
            'icon' => 'mdi:clipboard-text-outline',
        ];
    }

    private function serializeQuestion(TestQuestion $question): array
    {
        return [
            'id' => $question->id,
            'type' => $question->type,
            'text' => $question->text ?? '',
            'enabled' => $question->enabled,
            'image' => null,
            'imagePreviewUrl' => $question->image_path,
            ...($question->payload ?? []),
        ];
    }

    private function normalizeQuestionData(array $data): array
    {
        return [
            'type' => $data['type'],
            'text' => $data['text'] ?? '',
            'enabled' => $data['enabled'] ?? true,
            'image_path' => $data['imagePreviewUrl'] ?? null,
            'payload' => $this->extractQuestionPayload($data),
        ];
    }

    private function extractQuestionPayload(array $data): array
    {
        return match ($data['type']) {
            'simple' => [
                'options' => $data['options'] ?? [],
                'correctOptionId' => $data['correctOptionId'] ?? null,
            ],
            'multiple' => [
                'options' => $data['options'] ?? [],
            ],
            'matching' => [
                'pairs' => $data['pairs'] ?? [],
            ],
            'text' => [
                'correctAnswer' => $data['correctAnswer'] ?? '',
            ],
            'sequential' => [
                'blocks' => $data['blocks'] ?? [],
            ],
        };
    }

    private function ensureQuestionBelongsToTest(Test $test, TestQuestion $question): void
    {
        abort_if($question->test_id !== $test->id, 404);
    }
}
