<?php

declare(strict_types=1);

use App\Http\Controllers\AdminUsersController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::name('api.')->group(static function () {
    Route::name('v1.')->prefix('v1')->group(base_path('routes/v1/api.php'));
});

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('register', [AuthController::class, 'register'])->name('auth.register');
    Route::get('email-confirmation', [AuthController::class, 'emailConfirmation'])->name('auth.email-confirmation');
    Route::get('password-recovery', [AuthController::class, 'passwordRecovery'])->name('auth.password-recovery');
    Route::post('password-reset', [AuthController::class, 'passwordReset'])->name('auth.password-reset');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('me', [AuthController::class, 'me'])->name('auth.me');
    });
});

Route::middleware(['auth:sanctum', 'perm:tests.view'])
    ->prefix('admin/users')
    ->name('admin.users.')
    ->group(function () {
        Route::get('/', [AdminUsersController::class, 'index'])->name('index');
        Route::post('/', [AdminUsersController::class, 'store'])->name('store');
    });
