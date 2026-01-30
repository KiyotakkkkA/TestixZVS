<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\AdminTestsAccessIndexRequest;
use App\Http\Requests\Admin\AdminTestsAccessUpdateRequest;
use App\Http\Requests\Admin\AdminTestsAccessUsersRequest;
use App\Models\Test\Test;
use App\Services\Admin\AdminTestsAccessService;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;

class AdminTestsAccessController extends Controller
{
    protected AdminTestsAccessService $adminTestsAccessService;

    public function __construct(AdminTestsAccessService $adminTestsAccessService)
    {
        $this->adminTestsAccessService = $adminTestsAccessService;
    }

    public function index(AdminTestsAccessIndexRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->adminTestsAccessService->listTests(
            $request->user(),
            $validated
        );

        return response($data, 200);
    }

    public function update(AdminTestsAccessUpdateRequest $request, string $testId): Response
    {
        $test = Test::with('accessUsers')->find($testId);
        if (!$test) {
            return response([
                'message' => 'Тест не найден',
            ], 404);
        }

        $this->authorize('update', $test);

        $validated = $request->validated();

        $updated = $this->adminTestsAccessService->updateAccess(
            $request->user(),
            $test,
            $validated
        );

        return response([
            'test' => $updated,
        ], 200);
    }

    public function users(AdminTestsAccessUsersRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->adminTestsAccessService->listUsers($validated);

        return response($data, 200);
    }
}
