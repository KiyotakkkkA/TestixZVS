<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests_results', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('test_id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 32)->default('in_progress');
            $table->json('answers')->nullable();
            $table->json('question_order')->nullable();
            $table->json('answer_orders')->nullable();
            $table->string('current_question_id')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('test_id')
                ->references('id')
                ->on('tests')
                ->cascadeOnDelete();

            $table->index(['test_id', 'user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tests_results');
    }
};
