<?php

namespace App\Http\Controllers;

use App\Http\Requests\StatisticsSaveTestCompletionRequest;
use App\Services\Admin\AdminStatisticsService;

class StatisticsController extends Controller
{
    protected AdminStatisticsService $adminStatisticsService;

    public function __construct(AdminStatisticsService $adminStatisticsService)
    {
        $this->adminStatisticsService = $adminStatisticsService;
    }

    public function saveTetsCompletionStatistics(StatisticsSaveTestCompletionRequest $request)
    {
        $data = $request->validated();

        $this->adminStatisticsService->testStatistics($data);

        return response()->json(['message' => 'Test statistics saved successfully.'], 201);
    }
}
