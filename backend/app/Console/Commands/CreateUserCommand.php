<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Enum\UserStatuses;

#[Signature('zvs:create-user {email} {--password=}')]
#[Description('Create a new user with the specified email and password')]
class CreateUserCommand extends Command
{
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->option('password') ?? Str::random(12);

        $isEmailExists = User::where('email', $email)->exists();

        if ($isEmailExists) {
            $this->error("User with email '{$email}' already exists.");
            return Command::FAILURE;
        }

        $generatedUsername = 'Пользователь'.'@'.Str::random(12);

        $user = User::create([
            'name' => $generatedUsername,
            'email' => $email,
            'password' => Hash::make($password),
            'status' => UserStatuses::ACTIVE,
            'email_verified_at' => now(),
        ]);

        $this->info("User created successfully!");
        $this->info("Email: {$email}");
        $this->info("Password: {$password}");

        return Command::SUCCESS;
    }
}
