import { useCallback, useEffect } from "react";

import { adminAuditStore } from "../../../stores/admin/adminAuditStore";

import type { AdminAuditFilters } from "../../../types/admin/AdminAudit";

export const useAdminAuditManage = (initialFilters?: AdminAuditFilters) => {
    useEffect(() => {
        if (initialFilters) {
            adminAuditStore.updateAuditFilters(initialFilters);
        }
    }, [initialFilters]);

    const updateFilters = useCallback((next: Partial<AdminAuditFilters>) => {
        adminAuditStore.updateAuditFilters(next);
    }, []);

    return {
        filters: adminAuditStore.auditFilters,
        appliedFilters: adminAuditStore.auditAppliedFilters,
        updateFilters,
    };
};
