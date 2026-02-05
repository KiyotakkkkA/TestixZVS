<?php

use App\Http\Controllers\Admin\AdminTestsAccessController;
use App\Http\Controllers\Admin\AdminUsersController;
use App\Http\Controllers\AI\AIController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\QuestionFilesController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\Teacher\TeacherUsersController;
use App\Http\Controllers\TestsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Роуты аутентификации и авторизации
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/verify', [AuthController::class, 'verify'])->name('auth.verify');
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    });
});

// Роуты для интеграции с языковыми моделями
Route::prefix('ai')->group(function () {
    Route::group(['middleware' => 'auth:sanctum'], function () {
        Route::post('/fill-test', [AIController::class, 'fillTestFromText'])->middleware('permission:edit tests')->name('ai.fill_test');
    });
    Route::post('/grade-full-answer', [AIController::class, 'gradeFullAnswer'])->name('ai.grade_full_answer');
});

// Админские роуты
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

// Роуты для панели преподавателя
Route::middleware(['auth:sanctum', 'permission:view teacher panel'])->prefix('teacher')->group(function () {
    Route::group(['prefix' => 'groups'], function () {
        Route::get('/', [TeacherUsersController::class, 'index'])->name('teacher.groups.index');
        Route::post('/', [TeacherUsersController::class, 'store'])->name('teacher.groups.store');
        Route::patch('/{group}/name', [TeacherUsersController::class, 'updateName'])->name('teacher.groups.update_name');
        Route::post('/{group}/participants', [TeacherUsersController::class, 'addParticipants'])->name('teacher.groups.add_participants');
        Route::delete('/{group}/participants/{user}', [TeacherUsersController::class, 'removeParticipant'])->name('teacher.groups.remove_participant');
        Route::delete('/{group}', [TeacherUsersController::class, 'destroy'])->name('teacher.groups.destroy');
        Route::get('/users', [TeacherUsersController::class, 'users'])->name('teacher.groups.users');
        Route::post('/users', [TeacherUsersController::class, 'registerUser'])->name('teacher.groups.users.register');
    });
});

// Роуты для скачиваний файлов
Route::middleware('auth:sanctum')->prefix('download')->group(function () {
    
    Route::get('/test/{testId}/pdf', [ReportsController::class, 'makeTestToPDF'])->middleware('permission:make reports')->name('download.test.pdf');
    Route::get('/test/{testId}/json', [ReportsController::class, 'makeTestToJSON'])->middleware('permission:make reports')->name('download.test.json');

    Route::get('/admin/audit/pdf', [ReportsController::class, 'makeAuditToPDF'])->middleware('permission:make reports')->name('download.admin.audit.pdf');

});

// Роуты для редактирования тестов
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

// Роуты для всех
Route::get('/tests', [TestsController::class, 'index'])->name('tests.index');
Route::get('/tests/{testId}', [TestsController::class, 'publicShow'])->name('tests.show');

Route::post('/statistics/test', [StatisticsController::class, 'saveTetsCompletionStatistics'])->name('statistics.test.completion');