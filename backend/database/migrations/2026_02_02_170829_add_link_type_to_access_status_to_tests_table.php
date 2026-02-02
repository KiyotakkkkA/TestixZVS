<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->enum('access_status', ['all', 'auth', 'protected', 'link'])
                ->default('all')
                ->after('title')->change();
            $table->string('access_link')->nullable()->after('access_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn('access_link');
            $table->enum('access_status', ['all', 'auth', 'protected'])
                ->default('all')
                ->after('title')->change();
        });
    }
};
