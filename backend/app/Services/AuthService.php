<?php

namespace App\Services;

use App\Models\User;
use App\Enum\UserStatuses;
use Illuminate\Support\Str;

class AuthService
{
    private int $TOKEN_EXPIRATION_HOURS = 1;

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

        $user = new User([
            'name' => $generatedUsername,
            'email' => $data['email'],
            'password' => $data['password'],
            'status' => UserStatuses::CONFIRMATION_PENDING,
            'verification_token' => $generatedVerificationToken,
            'verification_token_expires_at' => $generatedVerificationTokenExpiresAt,
        ]);

        if (!$this->mailService->sendEmailVerification($user)) {
            return [
                'status' => 503,
                'data' => [
                    'message' => 'Не удалось отправить письмо подтверждения. Попробуйте позже.',
                ],
            ];
        }

        $user->save();

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
        $user = User::where('verification_token', $token)->first();

        if (!$user) {
            return [
                'status' => 404,
                'data' => [
                    'message' => 'Пользователь не найден.',
                ],
            ];
        }

        if (!User::checkIfVerificationTokenIsValid($token)) {
            return [
                'status' => 400,
                'data' => [
                    'message' => 'Неверный или просроченный токен подтверждения.',
                ],
            ];
        }

        $user->status = UserStatuses::ACTIVE;
        $user->verification_token = null;
        $user->verification_token_expires_at = null;
        
        if ($user->save()) {

            $this->mailService->sendRegistrationSuccess($user);

            return [
                'status' => 200,
                'data' => [],
            ];
        }

        return [
            'status' => 500,
            'data' => [
                'message' => 'Не удалось активировать учётную запись. Попробуйте позже.',
            ],
        ];
    }
}
