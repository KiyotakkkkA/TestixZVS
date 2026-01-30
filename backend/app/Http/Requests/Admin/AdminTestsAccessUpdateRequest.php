<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTestsAccessUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'access_status' => ['sometimes', 'string', Rule::in(['all', 'auth', 'protected'])],
            'user_ids' => ['sometimes', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
