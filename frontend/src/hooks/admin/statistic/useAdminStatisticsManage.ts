import { useCallback, useEffect } from "react";

import { adminStatisticsStore } from "../../../stores/admin/adminStatisticsStore";

import type { AdminStatisticsFilters } from "../../../types/admin/AdminStatistics";

export const useAdminStatisticsManage = (
    initialFilters?: AdminStatisticsFilters,
) => {
    useEffect(() => {
        if (initialFilters) {
            adminStatisticsStore.updateStatisticsFilters(initialFilters);
        }
    }, [initialFilters]);

    const updateFilters = useCallback(
        (next: Partial<AdminStatisticsFilters>) => {
            adminStatisticsStore.updateStatisticsFilters(next);
        },
        [],
    );

    return {
        filters: adminStatisticsStore.statisticsFilters,
        appliedFilters: adminStatisticsStore.statisticsAppliedFilters,
        updateFilters,
    };
};
