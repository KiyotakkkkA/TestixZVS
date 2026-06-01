<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

abstract class QueryFilter
{
    public function __construct(protected Request $request) {}

    public function apply(Builder $builder): Builder
    {
        foreach ($this->request->query() as $name => $value) {
            if ($value === null || $value === '' || in_array($name, $this->ignoredKeys(), true) || ! is_callable([$this, $name])) {
                continue;
            }

            $this->{$name}($builder, $value);
        }

        return $builder;
    }

    protected function ignoredKeys(): array
    {
        return [];
    }

    public function has(string $key): bool
    {
        return $this->request->query($key) !== null && $this->request->query($key) !== '';
    }
}
