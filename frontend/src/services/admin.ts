import { api } from './api';

import type { User } from '../types/User';
import type { AdminAuditFilters, AdminAuditResponse } from '../types/admin/AdminAudit';
import type { AdminCreateUserPayload, AdminPermissionsResponse, AdminRolesResponse, AdminUsersResponse } from '../types/admin/AdminUsers';

export const AdminService = {
  getUsers: async (): Promise<AdminUsersResponse> => {
    const { data } = await api.get<AdminUsersResponse>('/admin/users');
    return data;
  },

  getRoles: async (): Promise<AdminRolesResponse> => {
    const { data } = await api.get<AdminRolesResponse>('/admin/roles');
    return data;
  },

  getPermissions: async (): Promise<AdminPermissionsResponse> => {
    const { data } = await api.get<AdminPermissionsResponse>('/admin/permissions');
    return data;
  },

  updateUserRoles: async (userId: number, roles: string[]): Promise<User> => {
    const { data } = await api.patch<{ user: User }>(`/admin/users/${userId}/roles`, { roles });
    return data.user;
  },

  updateUserPermissions: async (userId: number, perms: string[]): Promise<User> => {
    const { data } = await api.patch<{ user: User }>(`/admin/users/${userId}/permissions`, { perms });
    return data.user;
  },

  createUser: async (payload: AdminCreateUserPayload): Promise<User> => {
    const { data } = await api.post<{ user: User }>('/admin/users', payload);
    return data.user;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  getAudit: async (filters: AdminAuditFilters = {}): Promise<AdminAuditResponse> => {
    const { data } = await api.get<AdminAuditResponse>('/admin/audit', {
      params: filters,
    });
    return data;
  },
};
