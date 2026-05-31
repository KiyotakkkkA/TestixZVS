<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'root',
            'admin',
            'editor',
            'user',
        ];

        $permissions = [
            'tests.view', // Просмотр тестов
            'tests.edit', // Создание, изменение и удаление тестов
            'tests.access', // Выдача доступа и изменение политик доступа к тестам
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $permissionMap = [
            'root' => $permissions,
            'admin' => $permissions,
            'editor' => ['tests.view', 'tests.edit'],
            'user' => ['tests.view'],
        ];

        foreach ($permissionMap as $role => $permissions) {
            $role = Role::where('name', $role)->first();
            $role->givePermissionTo($permissions);
        }
    }
}
