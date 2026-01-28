<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\AdminStatisticsRequest;
use App\Http\Requests\Admin\AdminStoreUserRequest;
use App\Http\Requests\Admin\AdminUpdatePermissionsRequest;
use App\Http\Requests\Admin\AdminUpdateRolesRequest;
use App\Http\Requests\Admin\AdminUsersIndexRequest;
use App\Models\User;
use App\Services\Admin\AdminUsersService;
use App\Services\Admin\AdminStatisticsService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AdminController extends Controller
{
    protected AdminUsersService $adminUsersService;
    protected AdminStatisticsService $adminStatisticsService;

    public function __construct(AdminUsersService $adminUsersService, AdminStatisticsService $adminStatisticsService)
    {
        $this->adminUsersService = $adminUsersService;
        $this->adminStatisticsService = $adminStatisticsService;
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

    public function statistics(AdminStatisticsRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->adminStatisticsService->getGeneralStatistics($validated);

        return response($data, 200);
    }
}
