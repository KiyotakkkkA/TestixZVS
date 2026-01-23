<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    protected $table = 'audit';

    protected $fillable = [
        'user_id',
        'action_type',
        'old_object_state',
        'new_object_state',
        'comment',
    ];

    protected $casts = [
        'old_object_state' => 'array',
        'new_object_state' => 'array',
    ];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
