<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_questions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('test_id');
            $table->string('type', 32);
            $table->text('text')->nullable();
            $table->boolean('enabled')->default(true);
            $table->string('image_path')->nullable();
            $table->json('payload')->nullable();
            $table->unsignedInteger('position')->default(1);
            $table->timestamps();

            $table->foreign('test_id')
                ->references('id')
                ->on('tests')
                ->cascadeOnDelete();

            $table->index(['test_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_questions');
    }
};
