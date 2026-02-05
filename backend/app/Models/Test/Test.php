<?php

namespace App\Models\Test;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use App\Enum\TestAccessStatus;

class Test extends Model
{
    use SoftDeletes;

    protected $table = 'tests';
    protected $keyType = 'string';
    protected $primaryKey = 'id';

    protected $fillable = [
        'id',
        'creator_id',
        'title',
        'access_status',
        'access_link',
        'total_questions',
        'total_disabled',
    ];

    public $appends = ['is_current_user_creator'];

    public $incrementing = false;
    public $timestamps = true;

    protected $casts = [
        'access_status' => TestAccessStatus::class,
    ];

    public function getIsCurrentUserCreatorAttribute(): bool
    {
        return $this->creator_id === auth('sanctum')->id();
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'test_id');
    }

    public function nonDisabledQuestions()
    {
        return $this->hasMany(Question::class, 'test_id')->where('disabled', 0);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function accessUsers()
    {
        return $this->belongsToMany(User::class, 'tests_access', 'test_id', 'user_id')
            ->withTimestamps();
    }

    public function accessEntries()
    {
        return $this->hasMany(TestAccess::class, 'test_id', 'id');
    }
}
