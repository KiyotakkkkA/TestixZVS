<?php

namespace App\Http\Controllers;

use App\Http\Requests\StatisticsSaveTestCompletionRequest;
use App\Http\Requests\Shared\TestsStatisticsRequest;
use App\Services\Shared\TestsStatisticsService;

class StatisticsController extends Controller
{
    protected TestsStatisticsService $testsStatisticsService;

    public function __construct(TestsStatisticsService $testsStatisticsService)
    {
        $this->testsStatisticsService = $testsStatisticsService;
    }

    public function saveTetsCompletionStatistics(StatisticsSaveTestCompletionRequest $request)
    {
        $data = $request->validated();

        $this->testsStatisticsService->testStatistics($data);

        return response()->json(['message' => 'Test statistics saved successfully.'], 201);
    }
}
