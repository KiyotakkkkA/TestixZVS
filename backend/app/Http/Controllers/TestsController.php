<?php

namespace App\Http\Controllers;

use App\Http\Requests\Tests\TestsAutoFillRequest;
use App\Http\Requests\Tests\TestsCreateRequest;
use App\Http\Requests\Tests\TestsIndexRequest;
use App\Http\Requests\Tests\TestsUpdateRequest;
use App\Models\Test\Test;
use App\Services\Tests\TestsService;
use Illuminate\Support\Facades\Storage;

class TestsController extends Controller
{
    protected TestsService $testsService;

    public function __construct(TestsService $testsService)
    {
        $this->testsService = $testsService;
    }

    public function createBlankTest(TestsCreateRequest $request)
    {
        $this->authorize('create', Test::class);

        $data = $request->validated();

        $test = $this->testsService->createBlankTest($data);

        return response()->json([
            'message' => 'Тест успешно создан',
            'testId' => $test->id,
        ], 201);
    }

    public function index(TestsIndexRequest $request)
    {
        $data = $request->validated();

        $sortBy = $data['sort_by'] ?? 'title';
        $sortDir = $data['sort_dir'] ?? 'asc';

        $perPage = (int) ($data['per_page'] ?? 10);
        $page = (int) ($data['page'] ?? 1);

        $tests = $this->testsService->listTests($sortBy, $sortDir, $perPage, $page);

        return response()->json([
            'data' => $tests->map(fn ($test) => [
                'id' => $test->id,
                'title' => $test->title,
                'total_questions' => $test->total_questions,
                'total_disabled' =>$test->total_disabled,
            ])->values()->all(),
            'pagination' => [
                'page' => $tests->currentPage(),
                'per_page' => $tests->perPage(),
                'total' => $tests->total(),
                'last_page' => $tests->lastPage(),
            ],
        ], 200);
    }

    public function show(string $testId)
    {
        $test = $this->testsService->getTestById($testId);

        if (!$test) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        }

        $this->authorize('view', $test);

        return response()->json([
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'total_questions' => $test->total_questions,
                'questions' => $test->questions->map(fn ($question) => [
                    'id' => $question->id,
                    'title' => $question->title,
                    'disabled' => $question->disabled,
                    'type' => $question->type,
                    'options' => $question->options,
                    'files' => $question->files->map(fn ($file) => [
                        'id' => $file->id,
                        'name' => $file->name,
                        'alias' => $file->alias,
                        'mime_type' => $file->mime_type,
                        'size' => $file->size,
                        'url' => Storage::disk('public')->url($file->alias),
                    ])->values()->all(),
                ])->values()->all(),
            ],
        ], 200);
    }

    public function publicShow(string $testId)
    {
        $test = $this->testsService->getTestById($testId);

        if (!$test) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        }

        $this->authorize('access', $test);

        $payload = $this->testsService->getPublicTestPayload($testId);

        return response()->json([
            'test' => $payload,
        ], 200);
    }

    public function update(TestsUpdateRequest $request, string $testId)
    {
        $data = $request->validated();

        $test = $this->testsService->getTestById($testId);
        if (!$test) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        }

        $this->authorize('update', $test);

        [$test, $changedQuestions] = $this->testsService->updateTest($testId, $data);

        return response()->json([
            'message' => 'Тест успешно обновлён',
            'changedQuestions' => $changedQuestions,
            'test' => [
                'id' => $test->id,
                'title' => $test->title,
                'total_questions' => $test->total_questions,
                'questions' => $test->questions->map(fn ($question) => [
                    'id' => $question->id,
                    'disabled' => $question->disabled,
                    'title' => $question->title,
                    'type' => $question->type,
                    'options' => $question->options,
                    'files' => $question->files->map(fn ($file) => [
                        'id' => $file->id,
                        'name' => $file->name,
                        'alias' => $file->alias,
                        'mime_type' => $file->mime_type,
                        'size' => $file->size,
                        'url' => Storage::disk('public')->url($file->alias),
                    ])->values()->all(),
                ])->values()->all(),
            ],
        ], 200);
    }

    public function autoFill(TestsAutoFillRequest $request, string $testId)
    {
        $data = $request->validated();

        $test = $this->testsService->getTestById($testId);
        if (!$test) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        }

        $this->authorize('autoFill', $test);

        [$test, $added] = $this->testsService->autoFillFromJson($testId, $data);

        return response()->json([
            'message' => 'Вопросы успешно импортированы',
            'added' => count($added),
            'total_questions' => $test->total_questions,
        ], 200);
    }

    public function destroy(string $testId)
    {
        $test = $this->testsService->getTestById($testId);
        if (!$test) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        }

        $this->authorize('delete', $test);

        $this->testsService->deleteTest($testId);

        return response()->json([
            'message' => 'Тест успешно удалён',
        ], 200);
    }
}
