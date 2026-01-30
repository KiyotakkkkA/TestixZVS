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
            $table->enum('access_status', ['all', 'auth', 'protected'])
                ->default('all')
                ->after('title');
        });

        Schema::create('tests_access', function (Blueprint $table) {
            $table->id();
            $table->uuid('test_id');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['test_id', 'user_id']);

            $table->foreign('test_id')
                ->references('id')
                ->on('tests')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tests_access');

        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn('access_status');
        });
    }
};
