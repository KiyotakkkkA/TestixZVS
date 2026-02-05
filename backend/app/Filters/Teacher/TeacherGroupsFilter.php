<?php

namespace App\Filters\Teacher;

use App\Filters\QueryFilter;
use Illuminate\Database\Eloquent\Builder;

class TeacherGroupsFilter extends QueryFilter
{
    public function search(Builder $query, string $search): void
    {
        $query->where('name', 'like', "%{$search}%");
    }
}