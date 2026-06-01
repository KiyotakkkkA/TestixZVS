<?php

declare(strict_types=1);

use App\Http\Controllers\AdminAuditController;
use App\Http\Controllers\AdminUsersController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'perm:users.view'])
    ->prefix('admin/users')
    ->name('admin.users.')
    ->group(function () {
        Route::get('/', [AdminUsersController::class, 'index'])->name('index');
        Route::post('/', [AdminUsersController::class, 'store'])->name('store')->middleware('perm:users.edit');
        Route::post('/access-change', [AdminUsersController::class, 'accessChange'])
            ->middleware('perm:users.access')
            ->name('access-change');
    });

Route::middleware(['auth:sanctum', 'perm:audit.view'])
    ->prefix('admin/audit')
    ->name('admin.audit.')
    ->group(function () {
        Route::get('/', [AdminAuditController::class, 'index'])->name('index');
        Route::get('/{uuid}', [AdminAuditController::class, 'show'])->name('show');
    });
