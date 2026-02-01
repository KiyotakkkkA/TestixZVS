import { useCallback } from "react";

import { adminUsersStore } from "../../../stores/admin/adminUsersStore";

import type { AdminUsersFilters } from "../../../types/admin/AdminUsers";

export const useAdminUsersManage = () => {
    const updateFilters = useCallback((next: Partial<AdminUsersFilters>) => {
        adminUsersStore.updateUsersFilters(next);
    }, []);

    return {
        filters: adminUsersStore.usersFilters,
        appliedFilters: adminUsersStore.usersAppliedFilters,
        updateFilters,
    };
};
