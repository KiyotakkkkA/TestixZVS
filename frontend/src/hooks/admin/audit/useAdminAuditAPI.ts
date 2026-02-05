import { useQuery } from "react-query";

import { AdminService } from "../../../services/admin";

import type {
    AdminAuditFilters,
    AdminAuditPagination,
} from "../../../types/admin/AdminAudit";

const DEFAULT_PAGINATION: AdminAuditPagination = {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
};

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

const normalizeFilters = (filters: AdminAuditFilters): AdminAuditFilters => ({
    ...filters,
    action_type: filters.action_type || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
});

export const useAdminAuditAPI = (filters: AdminAuditFilters) => {
    const appliedFilters = normalizeFilters(filters);

    const query = useQuery(
        ["admin", "audit", appliedFilters],
        () => AdminService.getAudit(appliedFilters),
        {
            keepPreviousData: true,
        },
    );

    return {
        records: query.data?.data ?? [],
        pagination: query.data?.pagination ?? DEFAULT_PAGINATION,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error
            ? getErrorMessage(query.error, "Не удалось загрузить журнал аудита")
            : null,
        refetch: query.refetch,
    };
};
