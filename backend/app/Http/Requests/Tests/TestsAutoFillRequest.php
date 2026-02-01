<?php

namespace App\Http\Requests\Tests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestsAutoFillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total' => 'required|integer|min:1',
            'selection' => 'nullable|string',
            'selectedIndexes' => 'nullable|array',
            'selectedIndexes.*' => 'integer|min:1',
            'questions' => 'required|array|min:1',
            'replace' => 'nullable|boolean',
            'questions.*.type' => ['required', 'string', Rule::in(['single', 'multiple', 'matching', 'full_answer'])],
            'questions.*.title' => 'nullable|string',
            'questions.*.options' => 'nullable|array',
            'questions.*.correctAnswers' => 'nullable|array',
            'questions.*.terms' => 'nullable|array',
            'questions.*.meanings' => 'nullable|array',
        ];
    }
}
