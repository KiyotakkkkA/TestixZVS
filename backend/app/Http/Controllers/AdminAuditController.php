<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use Illuminate\Http\Request;

class AdminAuditController extends Controller
{
    public function __construct(private AuditLogService $auditLogService) {}

    public function index(Request $request)
    {
        $result = $this->auditLogService->index($request);

        return response()->json($result['data'], $result['status']);
    }

    public function show(string $uuid)
    {
        $result = $this->auditLogService->show($uuid);

        return response()->json($result['data'], $result['status']);
    }
}
