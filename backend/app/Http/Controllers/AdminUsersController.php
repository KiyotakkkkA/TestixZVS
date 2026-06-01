<?php

namespace App\Http\Controllers;

use App\Filters\UsersFilter;
use App\Services\AdminUsersService;
use Illuminate\Http\Request;

class AdminUsersController extends Controller
{
    public function __construct(private AdminUsersService $adminUsersService) {}

    public function index(UsersFilter $filter)
    {
        $result = $this->adminUsersService->index($filter);

        return response()->json($result['data'], $result['status']);
    }

    public function store(Request $request)
    {
        $data = $request->validate(
            [
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|same:passwordConfirmation',
                'passwordConfirmation' => 'required|string|min:8',
            ],
            [
                'email.required' => 'Введите адрес электронной почты.',
                'email.email' => 'Введите корректный адрес электронной почты.',
                'email.max' => 'Адрес электронной почты не должен быть длиннее 255 символов.',
                'email.unique' => 'Пользователь с таким адресом уже зарегистрирован.',

                'password.required' => 'Введите пароль.',
                'password.min' => 'Пароль должен содержать минимум 8 символов.',
                'password.same' => 'Пароли не совпадают.',
            ],
        );

        $result = $this->adminUsersService->store($data);

        return response()->json($result['data'], $result['status']);
    }
}
