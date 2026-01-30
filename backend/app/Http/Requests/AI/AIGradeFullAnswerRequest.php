<?php

namespace App\Http\Requests\AI;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AIGradeFullAnswerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'questionText' => 'required|string|min:1',
            'correctAnswers' => 'required|array|min:1',
            'correctAnswers.*' => 'string',
            'userAnswer' => 'required|string|min:1',
            'checkMode' => ['nullable', 'string', Rule::in(['lite', 'medium', 'hard', 'unreal'])],
        ];
    }
}
