<?php

use App\Http\Controllers\Admin\AdminTestsAccessController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\TestsController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\QuestionFilesController;
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

// Admin routes
Route::middleware(['auth:sanctum', 'permission:view admin panel'])->prefix('admin')->group(function () {
    Route::get('/roles', [AdminUsersController::class, 'roles'])->name('admin.roles');
    Route::get('/permissions', [AdminUsersController::class, 'permissions'])->name('admin.permissions');

    Route::get('/audit', [AuditController::class, 'index'])->name('admin.audit')->middleware('permission:view audit logs');

    Route::group(['prefix' => 'users'], function () {
        Route::get('/', [AdminUsersController::class, 'index'])->name('admin.users');
        Route::post('/', [AdminUsersController::class, 'store'])->name('admin.users.store');
        Route::patch('/{user}/roles', [AdminUsersController::class, 'updateRoles'])->name('admin.users.roles');
        Route::patch('/{user}/permissions', [AdminUsersController::class, 'updatePermissions'])->name('admin.users.permissions');
        Route::delete('/{user}', [AdminUsersController::class, 'destroy'])->name('admin.users.delete');
    });

    Route::group(['prefix' => 'statistics'], function () {
        Route::get('/', [AdminUsersController::class, 'statistics'])->name('admin.statistics')->middleware('permission:view statistics');
    });

    Route::group(['prefix' => 'tests'], function () {
        Route::get('/access', [AdminTestsAccessController::class, 'index'])
            ->middleware('permission:edit tests access')
            ->name('admin.tests.access');
        Route::get('/access/users', [AdminTestsAccessController::class, 'users'])
            ->middleware('permission:edit tests access')
            ->name('admin.tests.access.users');
        Route::patch('/{testId}/access', [AdminTestsAccessController::class, 'update'])
            ->middleware('permission:edit tests access')
            ->name('admin.tests.access.update');
    });
});

// Download reports AND statistics
Route::middleware('auth:sanctum')->prefix('download')->group(function () {
    
    Route::get('/test/{testId}/pdf', [ReportsController::class, 'makeTestToPDF'])->middleware('permission:make reports')->name('download.test.pdf');
    Route::get('/test/{testId}/json', [ReportsController::class, 'makeTestToJSON'])->middleware('permission:make reports')->name('download.test.json');

});

// Workbench routes for test creation and editing
Route::middleware('auth:sanctum')->prefix('workbench')->group(function () {

    Route::group(['prefix' => 'tests'], function () {
        Route::post('/', [TestsController::class, 'createBlankTest'])->middleware('permission:create tests')->name('workbench.tests.store');
        Route::get('/{testId}', [TestsController::class, 'show'])->middleware('permission:edit tests')->name('workbench.tests.show');
        Route::put('/{testId}', [TestsController::class, 'update'])->middleware('permission:edit tests')->name('workbench.tests.update');
        Route::post('/{testId}/auto-fill', [TestsController::class, 'autoFill'])->middleware('permission:edit tests')->name('workbench.tests.auto_fill');
        Route::delete('/{testId}', [TestsController::class, 'destroy'])->middleware('permission:delete tests')->name('workbench.tests.delete');
    });

    Route::group(['prefix' => 'questions'], function () {
        Route::post('/{questionId}/files', [QuestionFilesController::class, 'store'])->middleware('permission:edit tests')->name('workbench.questions.files.store');
        Route::delete('/{questionId}/files/{fileId}', [QuestionFilesController::class, 'destroy'])->middleware('permission:edit tests')->name('workbench.questions.files.delete');
    });
});

Route::get('/tests', [TestsController::class, 'index'])->name('tests.index');
Route::get('/tests/{testId}', [TestsController::class, 'publicShow'])->name('tests.show');

Route::post('/statistics/test', [StatisticsController::class, 'saveTetsCompletionStatistics'])->name('statistics.test.completion');