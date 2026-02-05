import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

import type {
    AdminTestsAccessFilters,
    AdminTestsAccessPagination,
    AdminTestsAccessStatus,
} from "../../../types/admin/AdminTestsAccess";

const DEFAULT_PAGINATION: AdminTestsAccessPagination = {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
};

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

export const useAdminTestsAccessAPI = (
    filters: AdminTestsAccessFilters,
    userSearch?: string,
) => {
    const queryClient = useQueryClient();

    const testsQuery = useQuery(
        ["admin", "tests-access", filters],
        () => AdminService.getTestsAccessList(filters),
        { keepPreviousData: true },
    );

    const usersQuery = useQuery(
        ["admin", "tests-access", "users", userSearch ?? ""],
        () =>
            AdminService.getTestsAccessUsers({
                search: userSearch || undefined,
                limit: 100,
            }),
        { keepPreviousData: true },
    );

    const [statusUpdating, setStatusUpdating] = useState<
        Record<string, boolean>
    >({});
    const updateStatusMutation = useMutation(
        ({
            testId,
            status,
        }: {
            testId: string;
            status: AdminTestsAccessStatus;
        }) => AdminService.updateTestAccess(testId, { access_status: status }),
        {
            onMutate: ({ testId }) => {
                setStatusUpdating((prev) => ({ ...prev, [testId]: true }));
            },
            onSettled: (_data, _error, variables) => {
                setStatusUpdating((prev) => {
                    const next = { ...prev };
                    delete next[variables.testId];
                    return next;
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "tests-access"]);
            },
        },
    );

    const [usersUpdating, setUsersUpdating] = useState<Record<string, boolean>>(
        {},
    );
    const updateUsersMutation = useMutation(
        ({ testId, userIds }: { testId: string; userIds: number[] }) =>
            AdminService.updateTestAccess(testId, { user_ids: userIds }),
        {
            onMutate: ({ testId }) => {
                setUsersUpdating((prev) => ({ ...prev, [testId]: true }));
            },
            onSettled: (_data, _error, variables) => {
                setUsersUpdating((prev) => {
                    const next = { ...prev };
                    delete next[variables.testId];
                    return next;
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "tests-access"]);
            },
        },
    );

    return {
        tests: testsQuery.data?.data ?? [],
        pagination: testsQuery.data?.pagination ?? DEFAULT_PAGINATION,
        isLoading: testsQuery.isLoading,
        isFetching: testsQuery.isFetching,
        error: testsQuery.error
            ? getErrorMessage(
                  testsQuery.error,
                  "Не удалось загрузить список тестов",
              )
            : null,
        refetch: testsQuery.refetch,
        users: usersQuery.data?.data ?? [],
        usersLoading: usersQuery.isLoading,
        usersFetching: usersQuery.isFetching,
        usersError: usersQuery.error
            ? getErrorMessage(
                  usersQuery.error,
                  "Не удалось загрузить пользователей",
              )
            : null,
        usersRefetch: usersQuery.refetch,
        updateTestAccessStatus: (
            testId: string,
            status: AdminTestsAccessStatus,
        ) =>
            updateStatusMutation
                .mutateAsync({ testId, status })
                .then((resp) => resp.test),
        statusUpdating,
        updateTestAccessUsers: (testId: string, userIds: number[]) =>
            updateUsersMutation
                .mutateAsync({ testId, userIds })
                .then((resp) => resp.test),
        usersUpdating,
    };
};
