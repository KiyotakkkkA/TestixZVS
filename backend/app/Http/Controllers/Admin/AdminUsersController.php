<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Shared\TestsStatisticsRequest;
use App\Http\Requests\Admin\AdminStoreUserRequest;
use App\Http\Requests\Admin\AdminUpdatePermissionsRequest;
use App\Http\Requests\Admin\AdminUpdateRolesRequest;
use App\Http\Requests\Admin\AdminUsersIndexRequest;
use App\Models\User;
use App\Services\Admin\AdminUsersService;
use App\Services\Shared\TestsStatisticsService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Http\Controllers\Controller;

class AdminUsersController extends Controller
{
    protected AdminUsersService $adminUsersService;
    protected TestsStatisticsService $testsStatisticsService;

    public function __construct(AdminUsersService $adminUsersService, TestsStatisticsService $testsStatisticsService)
    {
        $this->adminUsersService = $adminUsersService;
        $this->testsStatisticsService = $testsStatisticsService;
    }

    public function index(AdminUsersIndexRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->adminUsersService->listUsers([
            'search' => $validated['search'] ?? null,
            'role' => $validated['role'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
            'page' => $validated['page'] ?? 1,
            'per_page' => $validated['per_page'] ?? 10,
        ]);

        return response($data, 200);
    }

    public function roles(): Response
    {
        return response([
            'roles' => $this->adminUsersService->listRoles(),
        ], 200);
    }

    public function permissions(): Response
    {
        return response([
            'permissions' => $this->adminUsersService->listPermissions(),
        ], 200);
    }

    public function updateRoles(AdminUpdateRolesRequest $request, User $user): Response
    {
        $this->authorize('updateRoles', $user);

        $validated = $request->validated();

        $updated = $this->adminUsersService->updateRoles($request->user(), $user, $validated['roles']);

        return response([
            'user' => $updated,
        ], 200);
    }

    public function updatePermissions(AdminUpdatePermissionsRequest $request, User $user): Response
    {
        $validated = $request->validated();

        $updated = $this->adminUsersService->updatePermissions($request->user(), $user, $validated['perms']);

        return response([
            'user' => $updated,
        ], 200);
    }

    public function store(AdminStoreUserRequest $request): Response
    {
        $validated = $request->validated();

        $user = $this->adminUsersService->createUser($request->user(), $validated);

        return response([
            'user' => $user,
        ], 201);
    }

    public function destroy(Request $request, User $user): Response
    {
        $this->adminUsersService->deleteUser($request->user(), $user);

        return response([
            'message' => 'Пользователь удален',
        ], 200);
    }

    public function statistics(TestsStatisticsRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->testsStatisticsService->getGeneralStatistics($validated);

        return response($data, 200);
    }
}
