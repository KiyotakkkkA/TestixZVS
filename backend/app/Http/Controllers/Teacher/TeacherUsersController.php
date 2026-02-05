<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\TeacherGroupsIndexRequest;
use App\Http\Requests\Teacher\TeacherGroupsParticipantsRequest;
use App\Http\Requests\Teacher\TeacherGroupsRegisterUserRequest;
use App\Http\Requests\Teacher\TeacherGroupsStoreRequest;
use App\Http\Requests\Teacher\TeacherGroupsUpdateNameRequest;
use App\Http\Requests\Teacher\TeacherGroupsUsersRequest;
use App\Models\Group;
use App\Models\User;
use App\Services\Teacher\TeacherUsersService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TeacherUsersController extends Controller
{
    protected TeacherUsersService $teacherUsersService;

    public function __construct(TeacherUsersService $teacherUsersService)
    {
        $this->teacherUsersService = $teacherUsersService;
    }

    public function index(TeacherGroupsIndexRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->teacherUsersService->listGroups($request->user(), [
            'search' => $validated['search'] ?? null,
            'page' => $validated['page'] ?? 1,
            'per_page' => $validated['per_page'] ?? 10,
        ]);

        return response($data, 200);
    }

    public function store(TeacherGroupsStoreRequest $request): Response
    {
        $validated = $request->validated();

        $group = $this->teacherUsersService->createGroup($request->user(), $validated);

        return response([
            'group' => $group,
        ], 201);
    }

    public function updateName(TeacherGroupsUpdateNameRequest $request, Group $group): Response
    {
        $this->authorize('update', $group);

        $validated = $request->validated();

        $group = $this->teacherUsersService->updateName($group, $validated['name']);

        return response([
            'group' => $group,
        ], 200);
    }

    public function addParticipants(TeacherGroupsParticipantsRequest $request, Group $group): Response
    {
        $this->authorize('update', $group);

        $validated = $request->validated();

        $group = $this->teacherUsersService->addParticipants($group, $validated['user_ids']);

        return response([
            'group' => $group,
        ], 200);
    }

    public function removeParticipant(Request $request, Group $group, User $user): Response
    {
        $this->authorize('update', $group);

        $group = $this->teacherUsersService->removeParticipant($group, $user->id);

        return response([
            'group' => $group,
        ], 200);
    }

    public function destroy(Request $request, Group $group): Response
    {
        $this->authorize('delete', $group);

        $this->teacherUsersService->deleteGroup($group);

        return response([
            'message' => 'Группа удалена',
        ], 200);
    }

    public function users(TeacherGroupsUsersRequest $request): Response
    {
        $validated = $request->validated();

        $data = $this->teacherUsersService->listUsers($validated);

        return response($data, 200);
    }

    public function registerUser(TeacherGroupsRegisterUserRequest $request): Response
    {
        $validated = $request->validated();

        $user = $this->teacherUsersService->createUser($request->user(), $validated);

        return response([
            'user' => $user,
        ], 201);
    }
}
