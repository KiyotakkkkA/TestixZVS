import { useQuery } from "react-query";

import { AdminService } from "../../../services/admin";

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useAdminTestsAccessUsers = (search?: string) => {
    const query = useQuery(
        ["admin", "tests-access", "users", search ?? ""],
        () =>
            AdminService.getTestsAccessUsers({
                search: search || undefined,
                limit: 100,
            }),
        { keepPreviousData: true },
    );

    return {
        users: query.data?.data ?? [],
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error
            ? getErrorMessage(query.error, "Не удалось загрузить пользователей")
            : null,
        refetch: query.refetch,
    };
};
