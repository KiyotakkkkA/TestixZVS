<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class TestAccess extends Model
{
    protected $table = 'tests_access';

    protected $fillable = [
        'test_id',
        'user_id',
    ];

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id', 'id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
