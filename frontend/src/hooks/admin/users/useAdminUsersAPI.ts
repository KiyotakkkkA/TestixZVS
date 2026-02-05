import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { AdminService } from "../../../services/admin";

import type {
    AdminCreateUserPayload,
    AdminPermissionsResponse,
    AdminRolesResponse,
    AdminUsersFilters,
    AdminUsersPagination,
} from "../../../types/admin/AdminUsers";

const DEFAULT_PAGINATION: AdminUsersPagination = {
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
};

const getErrorMessage = (error: any, fallback: string) =>
    error?.response?.data?.message || error?.message || fallback;

const normalizeFilters = (filters: AdminUsersFilters): AdminUsersFilters => ({
    search: filters.search || undefined,
    role: filters.role || undefined,
    permissions:
        filters.permissions && filters.permissions.length
            ? filters.permissions
            : undefined,
    page: filters.page,
    per_page: filters.per_page,
});

export const useAdminUsersAPI = (filters: AdminUsersFilters) => {
    const queryClient = useQueryClient();
    const appliedFilters = normalizeFilters(filters);

    const usersQuery = useQuery(
        ["admin", "users", appliedFilters],
        () => AdminService.getUsers(appliedFilters),
        { keepPreviousData: true },
    );

    const rolesQuery = useQuery(["admin", "roles"], () =>
        AdminService.getRoles(),
    );

    const permissionsQuery = useQuery(["admin", "permissions"], () =>
        AdminService.getPermissions(),
    );

    const createMutation = useMutation(
        (payload: AdminCreateUserPayload) => AdminService.createUser(payload),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
    const deleteMutation = useMutation(
        (userId: number) => AdminService.deleteUser(userId),
        {
            onMutate: (userId) => {
                setDeletingIds((prev) => ({ ...prev, [userId]: true }));
            },
            onSettled: (_data, _error, userId) => {
                setDeletingIds((prev) => {
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            },
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    const updateRolesMutation = useMutation(
        ({ userId, roles }: { userId: number; roles: string[] }) =>
            AdminService.updateUserRoles(userId, roles),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    const updatePermissionsMutation = useMutation(
        ({ userId, perms }: { userId: number; perms: string[] }) =>
            AdminService.updateUserPermissions(userId, perms),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["admin", "users"]);
            },
        },
    );

    const error =
        usersQuery.error || rolesQuery.error || permissionsQuery.error;

    return {
        users: usersQuery.data?.data ?? [],
        pagination: usersQuery.data?.pagination ?? DEFAULT_PAGINATION,
        roles: rolesQuery.data?.roles ?? ([] as AdminRolesResponse["roles"]),
        permissions:
            permissionsQuery.data?.permissions ??
            ({} as AdminPermissionsResponse["permissions"]),
        isLoading:
            usersQuery.isLoading ||
            rolesQuery.isLoading ||
            permissionsQuery.isLoading,
        isFetching:
            usersQuery.isFetching ||
            rolesQuery.isFetching ||
            permissionsQuery.isFetching,
        error: error ? getErrorMessage(error, "Ошибка загрузки данных") : null,
        createUser: createMutation.mutateAsync,
        isAdding: createMutation.isLoading,
        deleteUser: deleteMutation.mutateAsync,
        deletingIds,
        updateUserRoles: (userId: number, roles: string[]) =>
            updateRolesMutation.mutateAsync({ userId, roles }),
        isUpdatingRoles: updateRolesMutation.isLoading,
        updateUserPermissions: (userId: number, perms: string[]) =>
            updatePermissionsMutation.mutateAsync({ userId, perms }),
        isUpdatingPermissions: updatePermissionsMutation.isLoading,
    };
};
