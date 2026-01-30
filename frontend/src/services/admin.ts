import { api } from "../configs/api";

import type { User } from "../types/User";
import type {
    AdminAuditFilters,
    AdminAuditResponse,
} from "../types/admin/AdminAudit";
import type {
    AdminStatisticsFilters,
    AdminStatisticsResponse,
} from "../types/admin/AdminStatistics";
import type {
    AdminCreateUserPayload,
    AdminPermissionsResponse,
    AdminRolesResponse,
    AdminUsersFilters,
    AdminUsersResponse,
} from "../types/admin/AdminUsers";
import type {
    AdminTestsAccessFilters,
    AdminTestsAccessResponse,
    AdminTestsAccessUpdatePayload,
    AdminTestsAccessUsersResponse,
} from "../types/admin/AdminTestsAccess";

export const AdminService = {
    getUsers: async (
        filters: AdminUsersFilters = {},
    ): Promise<AdminUsersResponse> => {
        const { data } = await api.get<AdminUsersResponse>("/admin/users", {
            params: filters,
        });
        return data;
    },

    getRoles: async (): Promise<AdminRolesResponse> => {
        const { data } = await api.get<AdminRolesResponse>("/admin/roles");
        return data;
    },

    getPermissions: async (): Promise<AdminPermissionsResponse> => {
        const { data } =
            await api.get<AdminPermissionsResponse>("/admin/permissions");
        return data;
    },

    updateUserRoles: async (userId: number, roles: string[]): Promise<User> => {
        const { data } = await api.patch<{ user: User }>(
            `/admin/users/${userId}/roles`,
            { roles },
        );
        return data.user;
    },

    updateUserPermissions: async (
        userId: number,
        perms: string[],
    ): Promise<User> => {
        const { data } = await api.patch<{ user: User }>(
            `/admin/users/${userId}/permissions`,
            { perms },
        );
        return data.user;
    },

    createUser: async (payload: AdminCreateUserPayload): Promise<User> => {
        const { data } = await api.post<{ user: User }>(
            "/admin/users",
            payload,
        );
        return data.user;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },

    getAudit: async (
        filters: AdminAuditFilters = {},
    ): Promise<AdminAuditResponse> => {
        const { data } = await api.get<AdminAuditResponse>("/admin/audit", {
            params: filters,
        });
        return data;
    },

    getStatistics: async (
        filters: AdminStatisticsFilters = {},
    ): Promise<AdminStatisticsResponse> => {
        const { data } = await api.get<AdminStatisticsResponse>(
            "/admin/statistics",
            {
                params: filters,
            },
        );
        return data;
    },

    getTestsAccessList: async (
        filters: AdminTestsAccessFilters = {},
    ): Promise<AdminTestsAccessResponse> => {
        const { data } = await api.get<AdminTestsAccessResponse>(
            "/admin/tests/access",
            { params: filters },
        );
        return data;
    },

    updateTestAccess: async (
        testId: string,
        payload: AdminTestsAccessUpdatePayload,
    ): Promise<{ test: AdminTestsAccessResponse["data"][number] }> => {
        const { data } = await api.patch(
            `/admin/tests/${testId}/access`,
            payload,
        );
        return data;
    },

    getTestsAccessUsers: async (params?: {
        search?: string;
        limit?: number;
    }): Promise<AdminTestsAccessUsersResponse> => {
        const { data } = await api.get<AdminTestsAccessUsersResponse>(
            "/admin/tests/access/users",
            { params },
        );
        return data;
    },
};
