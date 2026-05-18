<?php

namespace App\Services;

class AuthService
{
    public function __construct()
    {
    }
    
    public function login($credentials)
    {
        return [
            'status' => 200,
            'data' => [],
        ];
    }

    public function register($data)
    {
        return [
            'status' => 201,
            'data' => [],
        ];
    }

    public function logout()
    {
        return [
            'status' => 200,
            'data' => [],
        ];
    }

    public function me()
    {
        return [
            'status' => 200,
            'data' => [
                'id' => 1,
                'name' => 'John Doe',
                'email' => 'john.doe@example.com'
            ],
        ];
    }

    public function passwordRecovery($email)
    {
        return [
            'status' => 200,
            'data' => [],
        ];
    }

    public function passwordReset($data)
    {
        return [
            'status' => 200,
            'data' => [],
        ];
    }

    public function emailConfirmation($token)
    {
        return [
            'status' => 200,
            'data' => [],
        ];
    }
}
