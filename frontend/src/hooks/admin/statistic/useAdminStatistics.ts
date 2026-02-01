import { useQuery } from "react-query";

import { AdminService } from "../../../services/admin";

import type { AdminStatisticsFilters } from "../../../types/admin/AdminStatistics";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

const normalizeFilters = (
    filters: AdminStatisticsFilters,
): AdminStatisticsFilters => ({
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    min_percentage:
        filters.min_percentage === "" ? undefined : filters.min_percentage,
});

export const useAdminStatistics = (filters: AdminStatisticsFilters) => {
    const appliedFilters = normalizeFilters(filters);

    const query = useQuery(
        ["admin", "statistics", appliedFilters],
        () => AdminService.getStatistics(appliedFilters),
        { keepPreviousData: true },
    );

    return {
        data: query.data ?? null,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error
            ? getErrorMessage(query.error, "Не удалось загрузить статистику")
            : null,
        refetch: query.refetch,
    };
};
