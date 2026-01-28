<?php

namespace App\Http\Controllers;

use App\Http\Requests\QuestionFilesStoreRequest;
use App\Models\Test\Question;
use App\Models\Test\QuestionFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class QuestionFilesController extends Controller
{
    public function store(QuestionFilesStoreRequest $request, int $questionId)
    {
        $question = Question::findOrFail($questionId);

        $request->validated();

        $uploaded = $request->file('files', []);
        if ($uploaded instanceof UploadedFile) {
            $uploaded = [$uploaded];
        }

        $files = collect($uploaded)->filter()->map(function ($file) use ($question) {
            $path = $file->store('question_files/', 'public');

            $record = QuestionFile::create([
                'question_id' => $question->id,
                'name' => $file->getClientOriginalName(),
                'alias' => $path,
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);

            return [
                'id' => $record->id,
                'name' => $record->name,
                'alias' => $record->alias,
                'mime_type' => $record->mime_type,
                'size' => $record->size,
                'url' => Storage::disk('public')->url($record->alias),
            ];
        });

        return response()->json([
            'files' => $files->values()->all(),
        ], 201);
    }

    public function destroy(int $questionId, int $fileId)
    {
        $file = QuestionFile::where('question_id', $questionId)->where('id', $fileId)->first();

        if (!$file) {
            return response()->json([
                'message' => 'Файл не найден',
            ], 404);
        }

        Storage::disk('public')->delete($file->alias);
        $file->delete();

        return response()->json([
            'message' => 'Файл удалён',
        ], 200);
    }
}
