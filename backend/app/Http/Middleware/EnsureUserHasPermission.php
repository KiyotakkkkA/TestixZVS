<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $requiredPermissions = collect($permissions)
            ->flatMap(static fn (string $permission): array => explode(',', $permission))
            ->map(static fn (string $permission): string => trim($permission))
            ->filter()
            ->values()
            ->all();

        abort_if($requiredPermissions === [], Response::HTTP_FORBIDDEN);
        abort_if($request->user() === null, Response::HTTP_UNAUTHORIZED);
        abort_unless($request->user()->hasAnyPermission($requiredPermissions), Response::HTTP_FORBIDDEN);

        return $next($request);
    }
}
