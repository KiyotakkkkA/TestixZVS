<?php

namespace App\Services;

use App\Models\User;
use App\Enum\UserStatuses;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class AuthService
{
    private int $TOKEN_EXPIRATION_HOURS = 1;
    private int $REMEMBER_TOKEN_EXPIRATION_DAYS = 30;

    public function __construct(private MailService $mailService)
    {
    }
    
    public function login($credentials)
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return [
                'status' => 401,
                'data' => [
                    'message' => 'Неверный адрес электронной почты или пароль.',
                ],
            ];
        }

        if ($user->status !== UserStatuses::ACTIVE) {
            return [
                'status' => 403,
                'data' => [
                    'message' => 'Подтвердите адрес электронной почты, чтобы войти.',
                ],
            ];
        }

        $rememberMe = (bool) ($credentials['rememberMe'] ?? false);
        $expiresAt = $rememberMe
            ? now()->addDays($this->REMEMBER_TOKEN_EXPIRATION_DAYS)
            : now()->addHours($this->TOKEN_EXPIRATION_HOURS);

        $token = $user->createToken('auth_token', ['*'], $expiresAt);

        return [
            'status' => 200,
            'data' => [
                'token' => $token->plainTextToken,
                'tokenType' => 'Bearer',
                'expiresAt' => $expiresAt->toISOString(),
                'user' => $this->serializeUser($user),
            ],
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

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return [
            'status' => 200,
            'data' => [],
        ];
    }

    public function me(Request $request)
    {
        return [
            'status' => 200,
            'data' => $this->serializeUser($request->user()),
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

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
        ];
    }
}
