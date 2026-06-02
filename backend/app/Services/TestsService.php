<?php

namespace App\Services;

use App\Filters\TestsFilter;
use App\Models\Test;
use App\Models\TestQuestion;
use App\Models\TestResult;
use App\Models\User;
use App\Repositories\TestQuestionsRepository;
use App\Repositories\TestResultsRepository;
use App\Repositories\TestsRepository;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TestsService
{
    public function __construct(
        private TestsRepository $testsRepository,
        private TestQuestionsRepository $testQuestionsRepository,
        private TestResultsRepository $testResultsRepository,
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
            $this->normalizeQuestionData($data, $question),
        );

        return [
            'status' => 200,
            'data' => $this->serializeQuestion($question),
        ];
    }

    public function deleteQuestion(Test $test, TestQuestion $question): array
    {
        $this->ensureQuestionBelongsToTest($test, $question);

        $this->deleteQuestionImage($question->image_path);

        $this->testQuestionsRepository->delete($question);

        return [
            'status' => 200,
            'data' => ['message' => 'Вопрос удалён.'],
        ];
    }

    public function currentResult(Test $test, User $user): array
    {
        $result = $this->testResultsRepository->findCurrent($test, $user);

        return [
            'status' => 200,
            'data' => [
                'hasSession' => $result !== null,
                'session' => $result ? $this->serializeResult($test->loadMissing('questions'), $result) : null,
            ],
        ];
    }

    public function latestResult(Test $test, User $user): array
    {
        $result = $this->testResultsRepository->findLatest($test, $user);

        return [
            'status' => 200,
            'data' => [
                'hasSession' => $result !== null,
                'session' => $result ? $this->serializeResult($test->loadMissing('questions'), $result) : null,
            ],
        ];
    }

    public function startResult(Test $test, User $user): array
    {
        $test->loadMissing('questions');

        $currentResult = $this->testResultsRepository->findCurrent($test, $user);

        if ($currentResult) {
            return [
                'status' => 200,
                'data' => $this->serializeResult($test, $currentResult),
            ];
        }

        $questions = $test->questions
            ->where('enabled', true)
            ->values();
        $questionOrder = $questions
            ->pluck('id')
            ->shuffle()
            ->values()
            ->all();
        $answerOrders = [];

        foreach ($questions as $question) {
            $answerOrders[$question->id] = $this->createAnswerOrder($question);
        }

        $result = $this->testResultsRepository->create([
            'id' => (string) Str::uuid(),
            'test_id' => $test->id,
            'user_id' => $user->id,
            'status' => 'in_progress',
            'answers' => [],
            'question_order' => $questionOrder,
            'answer_orders' => $answerOrders,
            'current_question_id' => $questionOrder[0] ?? null,
            'started_at' => now(),
        ]);

        return [
            'status' => 201,
            'data' => $this->serializeResult($test, $result),
        ];
    }

    public function answerQuestion(Test $test, TestResult $result, User $user, array $data): array
    {
        $this->ensureResultBelongsToTest($test, $result);
        $this->ensureResultBelongsToUser($user, $result);

        $answers = $result->answers ?? [];
        $answers[$data['questionId']] = [
            'value' => $data['answer'] ?? null,
            'checked' => $data['checked'] ?? false,
            'updatedAt' => now()->toISOString(),
        ];

        $result = $this->testResultsRepository->update($result, [
            'answers' => $answers,
            'current_question_id' => $data['questionId'],
        ]);

        return [
            'status' => 200,
            'data' => $this->serializeResult($test->loadMissing('questions'), $result),
        ];
    }

    public function completeResult(Test $test, TestResult $result, User $user): array
    {
        $this->ensureResultBelongsToTest($test, $result);
        $this->ensureResultBelongsToUser($user, $result);

        $result = $this->testResultsRepository->update($result, [
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return [
            'status' => 200,
            'data' => $this->serializeResult($test->loadMissing('questions'), $result),
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
        $payload = $this->normalizeQuestionPayloadForResponse(
            $question->type,
            $question->payload ?? [],
        );

        return [
            'id' => $question->id,
            'type' => $question->type,
            'text' => $question->text ?? '',
            'enabled' => $question->enabled,
            'image' => null,
            'imagePreviewUrl' => $question->image_path,
            ...$payload,
        ];
    }

    private function serializeResult(Test $test, TestResult $result): array
    {
        $orderedQuestions = $this->getOrderedResultQuestions($test, $result);
        $answers = $result->answers ?? [];

        return [
            'id' => $result->id,
            'testId' => $test->id,
            'status' => $result->status,
            'answers' => $answers,
            'currentQuestionId' => $result->current_question_id,
            'startedAt' => $result->started_at?->toISOString(),
            'completedAt' => $result->completed_at?->toISOString(),
            'answeredQuestionIds' => array_keys($answers),
            'unansweredQuestionIds' => $orderedQuestions
                ->pluck('id')
                ->reject(fn (string $id): bool => array_key_exists($id, $answers))
                ->values()
                ->all(),
            'test' => [
                ...$this->serializeTestDetails($test),
                'questions' => $orderedQuestions
                    ->map(fn (TestQuestion $question): array => $this->serializeQuestionForResult($question, $result))
                    ->values()
                    ->all(),
            ],
        ];
    }

    private function getOrderedResultQuestions(Test $test, TestResult $result)
    {
        $questionsById = $test->questions
            ->where('enabled', true)
            ->keyBy('id');

        return collect($result->question_order ?? [])
            ->map(fn (string $id) => $questionsById->get($id))
            ->filter()
            ->values();
    }

    private function serializeQuestionForResult(TestQuestion $question, TestResult $result): array
    {
        $serializedQuestion = $this->serializeQuestion($question);
        $answerOrder = ($result->answer_orders ?? [])[$question->id] ?? [];

        return match ($question->type) {
            'simple' => [
                ...$serializedQuestion,
                'options' => $this->sortByOrder($serializedQuestion['options'], $answerOrder['options'] ?? []),
            ],
            'multiple' => [
                ...$serializedQuestion,
                'options' => $this->sortByOrder($serializedQuestion['options'], $answerOrder['options'] ?? []),
            ],
            'matching' => [
                ...$serializedQuestion,
                'pairs' => $this->sortByOrder($serializedQuestion['pairs'], $answerOrder['pairs'] ?? []),
                'definitions' => $this->sortByOrder($serializedQuestion['pairs'], $answerOrder['definitions'] ?? []),
            ],
            'sequential' => [
                ...$serializedQuestion,
                'blocks' => $this->sortByOrder($serializedQuestion['blocks'], $answerOrder['blocks'] ?? []),
            ],
            default => $serializedQuestion,
        };
    }

    private function createAnswerOrder(TestQuestion $question): array
    {
        $payload = $this->normalizeQuestionPayloadForResponse($question->type, $question->payload ?? []);

        return match ($question->type) {
            'simple', 'multiple' => [
                'options' => collect($payload['options'] ?? [])->pluck('id')->shuffle()->values()->all(),
            ],
            'matching' => [
                'pairs' => collect($payload['pairs'] ?? [])->pluck('id')->shuffle()->values()->all(),
                'definitions' => collect($payload['pairs'] ?? [])->pluck('id')->shuffle()->values()->all(),
            ],
            'sequential' => [
                'blocks' => collect($payload['blocks'] ?? [])->pluck('id')->shuffle()->values()->all(),
            ],
            default => [],
        };
    }

    private function sortByOrder(array $items, array $order): array
    {
        if ($order === []) {
            return $items;
        }

        $itemsById = collect($items)->keyBy('id');

        return collect($order)
            ->map(fn (string $id) => $itemsById->get($id))
            ->filter()
            ->values()
            ->all();
    }

    private function normalizeQuestionData(array $data, ?TestQuestion $currentQuestion = null): array
    {
        return [
            'type' => $data['type'],
            'text' => $data['text'] ?? '',
            'enabled' => $data['enabled'] ?? true,
            'image_path' => $this->resolveQuestionImagePath($data, $currentQuestion),
            'payload' => $this->extractQuestionPayload($data),
        ];
    }

    private function resolveQuestionImagePath(array $data, ?TestQuestion $currentQuestion = null): ?string
    {
        $currentImagePath = $currentQuestion?->image_path;

        if ((bool) ($data['removeImage'] ?? false)) {
            $this->deleteQuestionImage($currentImagePath);

            return null;
        }

        if (($data['image'] ?? null) instanceof UploadedFile) {
            $this->deleteQuestionImage($currentImagePath);

            return $this->storeQuestionImage($data['image']);
        }

        return $currentImagePath ?? $data['imagePreviewUrl'] ?? null;
    }

    private function storeQuestionImage(UploadedFile $image): string
    {
        Storage::disk('public')->makeDirectory('tests');

        $path = $image->store('tests', 'public');

        return '/storage/'.$path;
    }

    private function deleteQuestionImage(?string $imagePath): void
    {
        if (! $imagePath) {
            return;
        }

        $storagePath = str_starts_with($imagePath, '/storage/')
            ? Str::after($imagePath, '/storage/')
            : $imagePath;

        if (str_starts_with($storagePath, 'tests/')) {
            Storage::disk('public')->delete($storagePath);
        }
    }

    private function extractQuestionPayload(array $data): array
    {
        return match ($data['type']) {
            'simple' => [
                'options' => $this->normalizeOptions($data['options'] ?? []),
                'correctOptionId' => $data['correctOptionId'] ?? null,
            ],
            'multiple' => [
                'options' => $this->normalizeOptions($data['options'] ?? [], true),
            ],
            'matching' => [
                'pairs' => $this->normalizePairs($data['pairs'] ?? []),
            ],
            'text' => [
                'correctAnswer' => $data['correctAnswer'] ?? '',
            ],
            'sequential' => [
                'blocks' => $this->normalizeBlocks($data['blocks'] ?? []),
            ],
        };
    }

    private function normalizeQuestionPayloadForResponse(string $type, array $payload): array
    {
        return match ($type) {
            'simple' => [
                'options' => $this->normalizeOptions($payload['options'] ?? []),
                'correctOptionId' => $payload['correctOptionId'] ?? null,
            ],
            'multiple' => [
                'options' => $this->normalizeOptions($payload['options'] ?? [], true),
            ],
            'matching' => [
                'pairs' => $this->normalizePairs($payload['pairs'] ?? []),
            ],
            'text' => [
                'correctAnswer' => $payload['correctAnswer'] ?? '',
            ],
            'sequential' => [
                'blocks' => $this->normalizeBlocks($payload['blocks'] ?? []),
            ],
            default => [],
        };
    }

    private function normalizeOptions(array $options, bool $withCorrectFlag = false): array
    {
        return array_map(
            static function (array $option) use ($withCorrectFlag): array {
                $normalizedOption = [
                    'id' => (string) ($option['id'] ?? Str::uuid()),
                    'text' => $option['text'] ?? '',
                ];

                if ($withCorrectFlag) {
                    $normalizedOption['isCorrect'] = (bool) ($option['isCorrect'] ?? false);
                }

                return $normalizedOption;
            },
            $options,
        );
    }

    private function normalizePairs(array $pairs): array
    {
        return array_map(
            static fn (array $pair): array => [
                'id' => (string) ($pair['id'] ?? Str::uuid()),
                'term' => $pair['term'] ?? '',
                'definition' => $pair['definition'] ?? '',
            ],
            $pairs,
        );
    }

    private function normalizeBlocks(array $blocks): array
    {
        return array_map(
            static fn (array $block): array => [
                'id' => (string) ($block['id'] ?? Str::uuid()),
                'text' => $block['text'] ?? '',
            ],
            $blocks,
        );
    }

    private function ensureQuestionBelongsToTest(Test $test, TestQuestion $question): void
    {
        abort_if($question->test_id !== $test->id, 404);
    }

    private function ensureResultBelongsToTest(Test $test, TestResult $result): void
    {
        abort_if($result->test_id !== $test->id, 404);
    }

    private function ensureResultBelongsToUser(User $user, TestResult $result): void
    {
        abort_if((int) $result->user_id !== (int) $user->id, 404);
    }
}
