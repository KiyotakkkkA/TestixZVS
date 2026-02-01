import { useCallback, useEffect } from "react";

import { adminTestsAccessStore } from "../../../stores/admin/adminTestsAccessStore";

import type { AdminTestsAccessFilters } from "../../../types/admin/AdminTestsAccess";

export const useAdminTestsAccessManage = (
    initialFilters?: AdminTestsAccessFilters,
) => {
    useEffect(() => {
        if (initialFilters) {
            adminTestsAccessStore.updateFilters(initialFilters);
        }
    }, [initialFilters]);

    const updateFilters = useCallback(
        (next: Partial<AdminTestsAccessFilters>) => {
            adminTestsAccessStore.updateFilters(next);
        },
        [],
    );

    return {
        filters: adminTestsAccessStore.filters,
        appliedFilters: adminTestsAccessStore.appliedFilters,
        updateFilters,
    };
};
