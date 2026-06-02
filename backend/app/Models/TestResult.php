<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id', 'test_id', 'user_id', 'status', 'answers', 'question_order', 'answer_orders', 'current_question_id', 'started_at', 'completed_at'])]
class TestResult extends Model
{
    public $incrementing = false;

    public $table = 'tests_results';

    protected $keyType = 'string';

    protected $casts = [
        'answers' => 'array',
        'question_order' => 'array',
        'answer_orders' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
