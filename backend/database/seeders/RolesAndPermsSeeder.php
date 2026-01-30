<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\Permission;

class RolesAndPermsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            [
                'name' => 'create tests',
                'description' => 'создание тестов',
            ],
            [
                'name' => 'edit tests',
                'description' => 'редактирование тестов',
            ],
            [
                'name' => 'edit tests access',
                'description' => 'редактирование доступа к тестам',
            ],
            [
                'name' => 'delete tests',
                'description' => 'удаление тестов',
            ],
            [
                'name' => 'add users',
                'description' => 'добавление пользователей',
            ],
            [
                'name' => 'remove users',
                'description' => 'удаление пользователей',
            ],
            [
                'name' => 'assign editor role',
                'description' => 'назначение роли редактора',
            ],
            [
                'name' => 'assign admin role',
                'description' => 'назначение роли администратора',
            ],
            [
                'name' => 'assign permissions',
                'description' => 'назначение прав',
            ],
            [
                'name' => 'view admin panel',
                'description' => 'просмотр админ-панели',
            ],
            [
                'name' => 'view audit logs',
                'description' => 'просмотр журнала аудита',
            ],
            [
                'name' => 'view statistics',
                'description' => 'просмотр статистики',
            ],
            [
                'name' => 'tests master access',
                'description' => 'доступ к чужим тестам',
            ],
            [
                'name' => 'make reports',
                'description' => 'создание отчетов',
            ]
        ];

        foreach ($permissions as $permission) {
            Permission::updateOrCreate([
                'name' => $permission['name'],
            ], [
                'name' => $permission['name'],
                'description' => $permission['description'],
            ]);
        }

        $roles = [
            'root' => Permission::get('name')->toArray(),
            'admin' => [
                'create tests',
                'edit tests',
                'delete tests',
                'add users',
                'remove users',
                'assign editor role',
                'view admin panel',
            ],
            'editor' => [
                'create tests',
                'edit tests',
                'delete tests',
            ],
            'user' => [],
        ];
 
        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions($rolePermissions);
        }
    }
}
