import type { User } from "../User";

export type RoleOption = {
  name: string;
  permissions: string[];
};

export type AdminUsersResponse = {
  data: User[];
  pagination: AdminUsersPagination;
};

export type AdminUsersPagination = {
  page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type AdminUsersFilters = {
  search?: string;
  role?: string;
  permissions?: string[];
  page?: number;
  per_page?: number;
};

export type AdminRolesResponse = {
  roles: RoleOption[];
};

export type AdminPermissionsResponse = {
  permissions: Record<string, {
    name: string;
    description: string;
  }>;
};

export type AdminCreateUserPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string | null;
};