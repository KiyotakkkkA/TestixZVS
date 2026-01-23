import type { User } from "../User";

export type RoleOption = {
  name: string;
  permissions: string[];
};

export type AdminUsersResponse = {
  users: User[];
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