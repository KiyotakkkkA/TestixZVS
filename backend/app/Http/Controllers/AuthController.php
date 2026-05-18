<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AuthService;

class AuthController extends Controller
{
    private $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function login(Request $request)
    {
        $data = $request->only(['email', 'password']);
        $result = $this->authService->login($data);
        return response()->json($result['data'], $result['status']);
    }

    public function register(Request $request)
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
        $result = $this->authService->register($data);
        return response()->json($result['data'], $result['status']);
    }

    public function logout(Request $request)
    {
        $result = $this->authService->logout();
        return response()->json($result['data'], $result['status']);
    }

    public function me(Request $request)
    {
        $result = $this->authService->me();
        return response()->json($result['data'], $result['status']);
    }

    public function passwordRecovery(Request $request)
    {
        $email = $request->query('email');
        $result = $this->authService->passwordRecovery($email);
        return response()->json($result['data'], $result['status']);
    }

    public function passwordReset(Request $request)
    {
        $data = $request->only(['token', 'newPassword', 'newPasswordConfirmation']);
        $result = $this->authService->passwordReset($data);
        return response()->json($result['data'], $result['status']);
    }

    public function emailConfirmation(Request $request)
    {
        $token = $request->query('token');
        $result = $this->authService->emailConfirmation($token);
        return response()->json($result['data'], $result['status']);
    }
}
