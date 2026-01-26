<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TestsService;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class TestsController extends Controller
{
    protected TestsService $testsService;

    public function __construct(TestsService $testsService)
    {
        $this->testsService = $testsService;
    }

    public function createBlankTest(Request $request)
    {
        try {
            $data = $request->validate([
                'title' => 'required|string|max:255',
            ]);

            $test = $this->testsService->createBlankTest($data);

            return response()->json([
                'message' => 'Тест успешно создан',
                'testId' => $test->id,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $data = $request->validate([
            'sort_by' => ['nullable', 'string', Rule::in(['title'])],
            'sort_dir' => ['nullable', 'string', Rule::in(['asc', 'desc'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

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
        $payload = $this->testsService->getPublicTestPayload($testId);

        if (!$payload) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        }

        return response()->json([
            'test' => $payload,
        ], 200);
    }

    public function update(Request $request, string $testId)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'questions' => 'sometimes|array',
            'questions.*.id' => 'nullable|integer',
            'questions.*.client_id' => 'nullable|string',
            'questions.*.title' => 'required_with:questions|string',
            'questions.*.disabled' => 'boolean',
            'questions.*.type' => ['required_with:questions', 'string', Rule::in(['single', 'multiple', 'matching', 'full_answer'])],
            'questions.*.options' => 'nullable|array',
            'removed_question_ids' => 'sometimes|array',
            'removed_question_ids.*' => 'integer',
        ]);

        try {
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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function autoFill(Request $request, string $testId)
    {
        $data = $request->validate([
            'total' => 'required|integer|min:1',
            'selection' => 'nullable|string',
            'selectedIndexes' => 'nullable|array',
            'selectedIndexes.*' => 'integer|min:1',
            'questions' => 'required|array|min:1',
            'replace' => 'nullable|boolean',
            'questions.*.type' => ['required', 'string', Rule::in(['single', 'multiple', 'matching', 'full_answer'])],
            'questions.*.question' => 'nullable|string',
            'questions.*.title' => 'nullable|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.correctAnswers' => 'nullable|array',
            'questions.*.terms' => 'nullable|array',
            'questions.*.meanings' => 'nullable|array',
        ]);

        try {
            [$test, $added] = $this->testsService->autoFillFromJson($testId, $data);

            return response()->json([
                'message' => 'Вопросы успешно импортированы',
                'added' => count($added),
                'total_questions' => $test->total_questions,
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Тест не найден',
            ], 404);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(string $testId)
    {
        try {
            $deleted = $this->testsService->deleteTest($testId);

            if (!$deleted) {
                return response()->json([
                    'message' => 'Тест не найден',
                ], 404);
            }

            return response()->json([
                'message' => 'Тест успешно удалён',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
