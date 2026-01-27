<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TestStatistic extends Model
{
    protected $table = 'tests_statistics';

    protected $fillable = [
        'test_id',
        'user_id',
        'type',
        'right_answers',
        'wrong_answers',
        'percentage',
        'time_taken',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id', 'id');
    }
}
