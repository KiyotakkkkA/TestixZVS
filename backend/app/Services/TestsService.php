<?php

namespace App\Services;

use App\Filters\TestsFilter;
use App\Models\Test;
use App\Models\User;
use App\Repositories\TestsRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TestsService
{
    public function __construct(
        private TestsRepository $testsRepository,
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

    private function serializeTest(Test $test): array
    {
        return [
            'id' => $test->id,
            'authorId' => $test->author_id,
            'title' => $test->title,
            'description' => $test->description,
            'questionsCount' => 0,
            'duration' => $test->estimated_pass_time_int,
            'rating' => 0,
            'passedCount' => 0,
            'createdAt' => $test->created_at?->toDateString(),
            'icon' => 'mdi:clipboard-text-outline',
        ];
    }
}
