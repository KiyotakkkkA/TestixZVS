<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        return response()->json(['message' => 'Login successful']);
    }

    public function register(Request $request)
    {
        return response()->json(['message' => 'Registration successful']);
    }

    public function logout(Request $request)
    {
        return response()->json(['message' => 'Logout successful']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'id' => 1,
            'name' => 'John Doe',
            'email' => 'john@doe.com'
        ]);
    }

    public function passwordRecovery(Request $request)
    {
        $email = $request->query('email');
        return response()->json(['message' => 'Password recovery email sent']);
    }

    public function passwordReset(Request $request)
    {
        return response()->json(['message' => 'Password reset successful']);
    }

    public function emailConfirmation(Request $request)
    {
        return response()->json(['message' => 'Email confirmed']);
    }
}
