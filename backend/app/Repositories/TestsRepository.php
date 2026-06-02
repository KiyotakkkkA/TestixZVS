<?php

namespace App\Repositories;

use App\Filters\TestsFilter;
use App\Models\Test;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TestsRepository
{
    public function paginate(TestsFilter $filter): LengthAwarePaginator
    {
        $query = Test::query();

        $filter->apply($query);

        if (! $filter->has('sortBy')) {
            $query->latest('created_at');
        }

        return $query->paginate(
            perPage: $filter->perPage(),
            page: $filter->page(),
        );
    }

    public function create(array $data): Test
    {
        return Test::create($data);
    }

    public function findWithQuestions(string $id): Test
    {
        return Test::query()
            ->with('questions')
            ->findOrFail($id);
    }
}
