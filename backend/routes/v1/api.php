<?php

declare(strict_types=1);

use App\Http\Controllers\AdminAuditController;
use App\Http\Controllers\AdminUsersController;
use App\Http\Controllers\TestsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'perm:tests.view'])
    ->prefix('tests')
    ->name('tests.')
    ->group(function () {
        Route::get('/', [TestsController::class, 'index'])->name('index');
        Route::post('/', [TestsController::class, 'store'])
            ->middleware('perm:tests.edit')
            ->name('store');
        Route::get('/{test}', [TestsController::class, 'show'])->name('show');
        Route::post('/{test}/questions', [TestsController::class, 'storeQuestion'])
            ->middleware('perm:tests.edit')
            ->name('questions.store');
        Route::put('/{test}/questions/{question}', [TestsController::class, 'updateQuestion'])
            ->middleware('perm:tests.edit')
            ->name('questions.update');
        Route::post('/{test}/questions/{question}', [TestsController::class, 'updateQuestion'])
            ->middleware('perm:tests.edit')
            ->name('questions.update.multipart');
        Route::delete('/{test}/questions/{question}', [TestsController::class, 'deleteQuestion'])
            ->middleware('perm:tests.edit')
            ->name('questions.delete');
        Route::get('/{test}/results/current', [TestsController::class, 'currentResult'])
            ->name('results.current');
        Route::get('/{test}/results/latest', [TestsController::class, 'latestResult'])
            ->name('results.latest');
        Route::post('/{test}/results/start', [TestsController::class, 'startResult'])
            ->name('results.start');
        Route::put('/{test}/results/{result}/answer', [TestsController::class, 'answerQuestion'])
            ->name('results.answer');
        Route::post('/{test}/results/{result}/complete', [TestsController::class, 'completeResult'])
            ->name('results.complete');
    });

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
