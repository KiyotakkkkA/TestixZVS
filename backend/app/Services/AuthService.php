<?php

namespace App\Services;

use App\Models\User;
use App\Enum\UserStatuses;
use Illuminate\Support\Str;

class AuthService
{
    private int $TOKEN_EXPIRATION_HOURS = 24;

    public function __construct(private MailService $mailService)
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

        $generatedVerificationToken = Str::random(64);
        $generatedVerificationTokenExpiresAt = now()->addHours($this->TOKEN_EXPIRATION_HOURS);
        $generatedUsername = 'Пользователь'.'@'.Str::random(12);

        $user = User::create([
            'name' => $generatedUsername,
            'email' => $data['email'],
            'password' => $data['password'],
            'status' => UserStatuses::CONFIRMATION_PENDING,
            'verification_token' => $generatedVerificationToken,
            'verification_token_expires_at' => $generatedVerificationTokenExpiresAt,
        ]);

        $this->mailService->sendEmailVerification($user);

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
