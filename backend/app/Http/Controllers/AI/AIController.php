<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Http\Requests\AI\AIFillTestRequest;
use App\Http\Requests\AI\AIGradeFullAnswerRequest;
use App\Services\AI\AIService;

class AIController extends Controller
{
    public function __construct(private AIService $aiService)
    {
    }

    public function fillTestFromText(AIFillTestRequest $request)
    {
        $data = $request->validated();

        $result = $this->aiService->fillTestFromText($data['text']);

        return response()->json([
            'result' => $result,
        ], 200);
    }

    public function gradeFullAnswer(AIGradeFullAnswerRequest $request)
    {
        $data = $request->validated();

        $result = $this->aiService->gradeFullAnswer(
            $data['questionText'],
            $data['correctAnswers'],
            $data['userAnswer'],
            $data['checkMode'] ?? 'medium',
        );

        return response()->json([
            'result' => $result,
        ], 200);
    }
}
