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
            'tests.master', // Мастер-доступ к тестам
            'users.view', // Просмотр пользователей
            'users.edit', // Создание и изменение пользователей
            'users.access', // Изменение прав пользователей
            'audit.view', // Просмотр журнала аудита
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $permissionMap = [
            'root' => $permissions,
            'admin' => array_filter($permissions, function ($p) {
                return $p !== 'users.access'; // Не даём админу права на изменение прав по умолчанию
            }),
            'editor' => ['tests.view', 'tests.edit'],
            'user' => ['tests.view'],
        ];

        foreach ($permissionMap as $role => $permissions) {
            $role = Role::where('name', $role)->first();
            $role->givePermissionTo($permissions);
        }
    }
}
