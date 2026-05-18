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
        $data = $request->only(['name', 'email', 'password']);
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
