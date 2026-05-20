<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;
use App\Models\User;

#[Signature('zvs:grant-access {email} {--role=}')]
#[Description('Grant access to a user with a specific role')]
class GrantAccessCommand extends Command
{
    public function handle()
    {
        $email = $this->argument('email');
        $role = $this->option('role') ?? 'user';

        $isRoleExists = Role::where('name', $role)->exists();

        if (!$isRoleExists) {
            $this->error("Role '{$role}' does not exist.");
            return Command::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email '{$email}' does not exist.");
            return Command::FAILURE;
        }

        $user->assignRole($role);

        $this->info("Access granted successfully!");
        $this->info("Email: {$email}");
        $this->info("Role: {$role}");

        return Command::SUCCESS;
    }
}
