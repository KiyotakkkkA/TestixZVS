<?php

namespace App\Http\Controllers;

use App\Filters\TestsFilter;
use App\Services\TestsService;
use Illuminate\Http\Request;

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
}
