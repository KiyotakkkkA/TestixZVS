import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminService } from '../../services/admin';

import type { User } from '../../types/User';
import type { AdminPermissionsResponse, AdminUsersFilters, AdminUsersPagination, RoleOption } from '../../types/admin/AdminUsers';

export type AdminCreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export const useAdministrateUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [permissions, setPermissions] = useState<AdminPermissionsResponse['permissions']>({});
  const [pagination, setPagination] = useState<AdminUsersPagination>({
    page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });
  const [filters, setFilters] = useState<AdminUsersFilters>({
    search: '',
    role: '',
    permissions: [],
    page: 1,
    per_page: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});

  const appliedFilters = useMemo(() => ({
    search: filters.search || undefined,
    role: filters.role || undefined,
    permissions: filters.permissions && filters.permissions.length ? filters.permissions : undefined,
    page: filters.page,
    per_page: filters.per_page,
  }), [filters]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [usersResp, rolesResp, permsResp] = await Promise.all([
        AdminService.getUsers(appliedFilters),
        AdminService.getRoles(),
        AdminService.getPermissions(),
      ]);
      setUsers(usersResp.data);
      setPagination(usersResp.pagination);
      setRoles(rolesResp.roles);
      setPermissions(permsResp.permissions);
    } catch (e: any) {
      setError(getErrorMessage(e, 'Ошибка загрузки данных'));
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilters = useCallback((next: Partial<AdminUsersFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...next };
      const shouldResetPage = Object.keys(next).some((key) => key !== 'page' && key !== 'per_page');
      if (shouldResetPage) {
        updated.page = 1;
      }
      return updated;
    });
  }, []);

  const updateUserRoles = useCallback(async (userId: number, nextRoles: string[]) => {
    try {
      const updated = await AdminService.updateUserRoles(userId, nextRoles);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      return updated;
    } catch (e: any) {
      setError(getErrorMessage(e, 'Не удалось сохранить роли'));
      throw e;
    }
  }, []);

  const updateUserPermissions = useCallback(async (userId: number, nextPerms: string[]) => {
    try {
      const updated = await AdminService.updateUserPermissions(userId, nextPerms);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      return updated;
    } catch (e: any) {
      setError(getErrorMessage(e, 'Не удалось сохранить права'));
      throw e;
    }
  }, []);

  const deleteUser = useCallback(async (userId: number) => {
    setDeletingIds((prev) => ({ ...prev, [userId]: true }));
    try {
      await AdminService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e: any) {
      setError(getErrorMessage(e, 'Не удалось удалить пользователя'));
      throw e;
    } finally {
      setDeletingIds((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
  }, []);

  const createUser = useCallback(async (payload: AdminCreateUserPayload) => {
    setIsAdding(true);
    try {
      const created = await AdminService.createUser(payload);
      setUsers((prev) => [created, ...prev]);
      return created;
    } catch (e: any) {
      setError(getErrorMessage(e, 'Не удалось создать пользователя'));
      throw e;
    } finally {
      setIsAdding(false);
    }
  }, []);

  return {
    users,
    roles,
    permissions,
    pagination,
    filters,
    updateFilters,
    isLoading,
    isAdding,
    error,
    deletingIds,
    reload: load,
    createUser,
    deleteUser,
    updateUserRoles,
    updateUserPermissions,
  };
};
