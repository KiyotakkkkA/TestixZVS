<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Enum\UserStatuses;

#[Fillable(['name', 'email', 'password', 'status', 'verification_token', 'verification_token_expires_at', 'email_verified_at'])]
#[Hidden(['password', 'remember_token', 'verification_token', 'verification_token_expires_at', 'email_verified_at'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    use HasRoles;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verification_token_expires_at' => 'datetime',
            'status' => UserStatuses::class,
            'password' => 'hashed',
        ];
    }

    public static function checkIfVerificationTokenIsValid($token): bool
    {
        $user = self::where('verification_token', $token)->first();

        if (!$user) {
            return false;
        }

        return $user->verification_token_expires_at->isFuture();
    }
}
