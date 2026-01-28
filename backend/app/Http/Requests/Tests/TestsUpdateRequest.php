<?php

namespace App\Http\Requests\Tests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TestsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
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
        ];
    }
}
