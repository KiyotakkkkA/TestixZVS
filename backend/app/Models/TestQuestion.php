<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['id', 'test_id', 'type', 'text', 'enabled', 'image_path', 'payload', 'position'])]
class TestQuestion extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $casts = [
        'enabled' => 'boolean',
        'payload' => 'array',
        'position' => 'integer',
    ];

    public function test(): BelongsTo
    {
        return $this->belongsTo(Test::class);
    }
}
