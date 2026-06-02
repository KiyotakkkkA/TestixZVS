<?php

namespace App\Http\Controllers;

use App\Filters\TestsFilter;
use App\Models\Test;
use App\Models\TestQuestion;
use App\Models\TestResult;
use App\Services\TestsService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TestsController extends Controller
{
    public function __construct(private TestsService $testsService) {}

    public function index(TestsFilter $filter)
    {
        $result = $this->testsService->index($filter);

        return response()->json($result['data'], $result['status']);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'estimatedPassTime' => 'required|integer|min:1|max:1440',
            ],
            [
                'title.required' => 'Введите название теста.',
                'title.max' => 'Название теста не должно быть длиннее 255 символов.',
                'description.required' => 'Введите описание теста.',
                'estimatedPassTime.required' => 'Укажите примерное время прохождения.',
                'estimatedPassTime.min' => 'Время прохождения должно быть больше 0 минут.',
                'estimatedPassTime.max' => 'Время прохождения не должно превышать 1440 минут.',
            ],
        );

        $result = $this->testsService->store($data, $request->user(), $request);

        return response()->json($result['data'], $result['status']);
    }

    public function show(string $test)
    {
        $result = $this->testsService->show($test);

        return response()->json($result['data'], $result['status']);
    }

    public function storeQuestion(Request $request, Test $test)
    {
        $result = $this->testsService->storeQuestion(
            $test,
            $this->validateQuestion($request),
        );

        return response()->json($result['data'], $result['status']);
    }

    public function updateQuestion(Request $request, Test $test, TestQuestion $question)
    {
        $result = $this->testsService->updateQuestion(
            $test,
            $question,
            $this->validateQuestion($request),
        );

        return response()->json($result['data'], $result['status']);
    }

    public function deleteQuestion(Test $test, TestQuestion $question)
    {
        $result = $this->testsService->deleteQuestion($test, $question);

        return response()->json($result['data'], $result['status']);
    }

    public function currentResult(Request $request, Test $test)
    {
        $result = $this->testsService->currentResult($test, $request->user());

        return response()->json($result['data'], $result['status']);
    }

    public function latestResult(Request $request, Test $test)
    {
        $result = $this->testsService->latestResult($test, $request->user());

        return response()->json($result['data'], $result['status']);
    }

    public function startResult(Request $request, Test $test)
    {
        $result = $this->testsService->startResult($test, $request->user());

        return response()->json($result['data'], $result['status']);
    }

    public function answerQuestion(Request $request, Test $test, TestResult $result)
    {
        $data = $request->validate([
            'questionId' => 'required|string',
            'answer' => 'nullable',
            'checked' => 'boolean',
        ]);

        $serviceResult = $this->testsService->answerQuestion(
            $test,
            $result,
            $request->user(),
            $data,
        );

        return response()->json($serviceResult['data'], $serviceResult['status']);
    }

    public function completeResult(Request $request, Test $test, TestResult $result)
    {
        $serviceResult = $this->testsService->completeResult(
            $test,
            $result,
            $request->user(),
        );

        return response()->json($serviceResult['data'], $serviceResult['status']);
    }

    private function validateQuestion(Request $request): array
    {
        if ($request->filled('question')) {
            $decodedQuestion = json_decode((string) $request->input('question'), true);

            if (! is_array($decodedQuestion)) {
                throw ValidationException::withMessages([
                    'question' => 'Некорректные данные вопроса.',
                ]);
            }

            unset($decodedQuestion['image']);

            $request->merge($decodedQuestion);
        }

        $data = $request->validate([
            'type' => 'required|string|in:simple,multiple,matching,text,sequential',
            'text' => 'nullable|string',
            'enabled' => 'required|boolean',
            'imagePreviewUrl' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'removeImage' => 'sometimes|boolean',
            'options' => 'array',
            'options.*.id' => 'required_with:options|string',
            'options.*.text' => 'nullable|string',
            'options.*.isCorrect' => 'boolean',
            'correctOptionId' => 'nullable|string',
            'pairs' => 'array',
            'pairs.*.id' => 'required_with:pairs|string',
            'pairs.*.term' => 'nullable|string',
            'pairs.*.definition' => 'nullable|string',
            'correctAnswer' => 'nullable|string',
            'blocks' => 'array',
            'blocks.*.id' => 'required_with:blocks|string',
            'blocks.*.text' => 'nullable|string',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        return $data;
    }
}
