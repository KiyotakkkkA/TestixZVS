<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::name('api.')->group(static function () {
    Route::name('v1.')->prefix('v1')->group(base_path('routes/api/v1.php'));
});