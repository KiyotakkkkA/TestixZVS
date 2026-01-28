<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionFilesStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'files' => ['required'],
            'files.*' => ['file', 'max:10240', 'mimes:jpg,jpeg,png,svg,webp,gif'],
        ];
    }
}
