<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuditController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });
});

Route::middleware(['auth:sanctum', 'permission:view admin panel'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index'])->name('admin.users');
    Route::post('/users', [AdminController::class, 'store'])->name('admin.users.store');
    Route::get('/roles', [AdminController::class, 'roles'])->name('admin.roles');
    Route::get('/permissions', [AdminController::class, 'permissions'])->name('admin.permissions');
    Route::patch('/users/{user}/roles', [AdminController::class, 'updateRoles'])->name('admin.users.roles');
    Route::patch('/users/{user}/permissions', [AdminController::class, 'updatePermissions'])->name('admin.users.permissions');
    Route::delete('/users/{user}', [AdminController::class, 'destroy'])->name('admin.users.delete');
    Route::get('/audit', [AuditController::class, 'index'])->name('admin.audit')->middleware('permission:view audit logs');
});
