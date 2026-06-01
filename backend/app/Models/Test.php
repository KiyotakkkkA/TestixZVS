<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id', 'author_id', 'title', 'description', 'estimated_pass_time_int'])]
class Test extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';
}
