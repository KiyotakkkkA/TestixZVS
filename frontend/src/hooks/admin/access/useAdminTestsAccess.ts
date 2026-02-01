import { useQuery } from "react-query";

import { AdminService } from "../../../services/admin";

import type {
    AdminTestsAccessFilters,
    AdminTestsAccessPagination,
} from "../../../types/admin/AdminTestsAccess";

const DEFAULT_PAGINATION: AdminTestsAccessPagination = {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
};

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useAdminTestsAccess = (filters: AdminTestsAccessFilters) => {
    const query = useQuery(
        ["admin", "tests-access", filters],
        () => AdminService.getTestsAccessList(filters),
        { keepPreviousData: true },
    );

    return {
        tests: query.data?.data ?? [],
        pagination: query.data?.pagination ?? DEFAULT_PAGINATION,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error
            ? getErrorMessage(query.error, "Не удалось загрузить список тестов")
            : null,
        refetch: query.refetch,
    };
};
