import { useQuery } from "react-query";

import { AdminService } from "../../../services/admin";

import type {
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

export const useAdminUsers = (filters: AdminUsersFilters) => {
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
    };
};
