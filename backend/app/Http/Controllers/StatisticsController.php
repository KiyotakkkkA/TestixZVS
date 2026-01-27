<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Admin\AdminStatisticsService;

class StatisticsController extends Controller
{
    protected AdminStatisticsService $adminStatisticsService;

    public function __construct(AdminStatisticsService $adminStatisticsService)
    {
        $this->adminStatisticsService = $adminStatisticsService;
    }

    public function saveTetsCompletionStatistics(Request $request)
    {
        $data = $request->validate([
            'test_id' => 'required|uuid|exists:tests,id',
            'type' => 'required|string|in:started,finished',
            'right_answers' => 'required|integer|min:0',
            'wrong_answers' => 'required|integer|min:0',
            'percentage' => 'required|numeric|min:0|max:100',
            'time_taken' => 'nullable',
        ]);

        $this->adminStatisticsService->testStatistics($data);

        return response()->json(['message' => 'Test statistics saved successfully.'], 201);
    }
}
