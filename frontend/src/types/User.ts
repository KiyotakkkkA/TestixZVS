export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    roles: UserRole[];
    perms: UserPermission[];
    created_at?: string;
    updated_at?: string;
};

export type UserRole = "admin" | "teacher" | "user" | "editor" | "root";

type PermissionsTestsManagement =
    | "create tests"
    | "edit tests"
    | "delete tests"
    | "edit tests access";
type PermissionsAccessManagement =
    | "tests master access"
    | "groups master access"
    | "users master access";
type PermissionsUsersManagement =
    | "add users"
    | "remove users"
    | "assign editor role"
    | "assign admin role"
    | "assign permissions"
    | "groups master access";
type PermissionsPages =
    | "view admin panel"
    | "view teacher panel"
    | "view audit logs"
    | "view statistics"
    | "make reports";

export type UserPermission =
    | PermissionsTestsManagement
    | PermissionsAccessManagement
    | PermissionsUsersManagement
    | PermissionsPages;
