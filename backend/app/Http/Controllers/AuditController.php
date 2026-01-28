<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuditIndexRequest;
use App\Models\Audit;
use Carbon\Carbon;
use Illuminate\Http\Response;

class AuditController extends Controller
{
    public function index(AuditIndexRequest $request): Response
    {
        $validated = $request->validated();

        $query = Audit::query()
            ->with('user')
            ->orderByDesc('id');

        if (!empty($validated['action_type'])) {
            $query->where('action_type', $validated['action_type']);
        }

        if (!empty($validated['date_from'])) {
            $from = Carbon::parse($validated['date_from'])->startOfDay();
            $query->where('created_at', '>=', $from);
        }

        if (!empty($validated['date_to'])) {
            $to = Carbon::parse($validated['date_to'])->endOfDay();
            $query->where('created_at', '<=', $to);
        }

        $perPage = (int) ($validated['per_page'] ?? 10);
        $page = (int) ($validated['page'] ?? 1);
        $items = $query->paginate($perPage, ['*'], 'page', $page);

        return response([
            'data' => $items->getCollection()->map(fn (Audit $audit) => [
                'id' => $audit->id,
                'action_type' => $audit->action_type,
                'old_object_state' => $audit->old_object_state,
                'new_object_state' => $audit->new_object_state,
                'comment' => $audit->comment,
                'created_at' => $audit->created_at,
                'actor' => $audit->user ? [
                    'id' => $audit->user->id,
                    'name' => $audit->user->name,
                    'email' => $audit->user->email,
                ] : null,
            ])->values()->all(),
            'pagination' => [
                'page' => $items->currentPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'last_page' => $items->lastPage(),
            ],
        ], 200);
    }
}
