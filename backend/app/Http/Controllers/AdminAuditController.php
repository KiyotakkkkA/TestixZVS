<?php

namespace App\Http\Controllers;

use App\Filters\AuditLogsFilter;
use App\Services\AuditLogService;

class AdminAuditController extends Controller
{
    public function __construct(private AuditLogService $auditLogService) {}

    public function index(AuditLogsFilter $filter)
    {
        $result = $this->auditLogService->index($filter);

        return response()->json($result['data'], $result['status']);
    }

    public function show(string $uuid)
    {
        $result = $this->auditLogService->show($uuid);

        return response()->json($result['data'], $result['status']);
    }
}
