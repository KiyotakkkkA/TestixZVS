<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StatisticsSaveTestCompletionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'test_id' => 'required|uuid|exists:tests,id',
            'type' => 'required|string|in:started,finished',
            'right_answers' => 'required|integer|min:0',
            'wrong_answers' => 'required|integer|min:0',
            'percentage' => 'required|numeric|min:0|max:100',
            'time_taken' => 'nullable',
        ];
    }
}
