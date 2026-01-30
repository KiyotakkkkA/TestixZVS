import { useCallback, useEffect } from "react";

import { adminTestsAccessStore } from "../../stores/admin/adminTestsAccessStore";

import type { AdminTestsAccessFilters } from "../../types/admin/AdminTestsAccess";

export const useAdminTestsAccess = (
    initialFilters?: AdminTestsAccessFilters,
) => {
    useEffect(() => {
        if (initialFilters) {
            adminTestsAccessStore.updateFilters(initialFilters);
        }
    }, [initialFilters]);

    useEffect(() => {
        adminTestsAccessStore.loadUsers();
        adminTestsAccessStore.loadTests();
    }, []);

    const updateFilters = useCallback(
        (next: Partial<AdminTestsAccessFilters>) => {
            adminTestsAccessStore.updateFilters(next);
        },
        [],
    );

    return {
        tests: adminTestsAccessStore.tests,
        pagination: adminTestsAccessStore.pagination,
        filters: adminTestsAccessStore.filters,
        users: adminTestsAccessStore.users,
        isLoading: adminTestsAccessStore.isLoading,
        isUpdating: adminTestsAccessStore.isUpdating,
        usersLoading: adminTestsAccessStore.usersLoading,
        error: adminTestsAccessStore.error,
        usersError: adminTestsAccessStore.usersError,
        loadUsers: adminTestsAccessStore.loadUsers,
        loadTests: adminTestsAccessStore.loadTests,
        updateFilters,
        updateTestAccessStatus: adminTestsAccessStore.updateTestAccessStatus,
        updateTestAccessUsers: adminTestsAccessStore.updateTestAccessUsers,
    };
};
