<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthService
{
    public function register(array $data): array
    {
        if (User::where('email', $data['email'])->exists()) {
            throw ValidationException::withMessages([
                'email' => ['Email уже зарегистрирован'],
            ]);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        if (Role::where('name', 'user')->exists()) {
            $user->assignRole('user');
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $this->formatUser($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email или пароль не верны'],
            ]);
        }

        $expiresAt = $credentials['rememberMe'] ? null : now()->addHours(12);

        $token = $user->createToken('auth_token', [], $expiresAt)->plainTextToken;

        return [
            'user' => $this->formatUser($user),
            'token' => $token,
            'token_type' => 'Bearer',
        ];
    }

    public function getCurrentUser(): ?array
    {
        $user = Auth::user();
        if (!$user) {
            return null;
        }

        return $this->formatUser($user);
    }

    public function logout(): bool
    {
        $user = Auth::user();
        if ($user) {
            $user->tokens()->delete();
            return true;
        }
        return false;
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'roles' => $user->getRoleNames()->values()->all(),
            'perms' => $user->getAllPermissions()->pluck('name')->values()->all(),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}
