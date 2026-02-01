import { useState } from "react";
import { Icon } from "@iconify/react";

import { AdminUserRolesForm } from "../../forms/admin";
import { Button, Spinner } from "../../../atoms";
import { ROLES_NAMES } from "../../../../data/admin";

import type { User } from "../../../../types/User";
import type {
    AdminPermissionsResponse,
    RoleOption,
} from "../../../../types/admin/AdminUsers";

export type AdminUserCardProps = {
    user: User;
    roles: RoleOption[];
    permissions: AdminPermissionsResponse["permissions"];
    rolePermissionsMap: Record<string, string[]>;
    maxRoleRank: number;
    isSelf: boolean;
    isRankHigher?: boolean;
    canDelete: boolean;
    isDeleting?: boolean;
    onRequestDelete: (user: User) => void;
    onSaveRoles: (userId: number, roles: string[]) => Promise<void>;
    onSavePermissions: (userId: number, perms: string[]) => Promise<void>;
    canAssignPermissions: boolean;
};

export const AdminUserCard = ({
    user,
    roles,
    permissions,
    rolePermissionsMap,
    maxRoleRank,
    isSelf,
    isRankHigher,
    canDelete,
    isDeleting,
    onRequestDelete,
    onSaveRoles,
    onSavePermissions,
    canAssignPermissions,
}: AdminUserCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="text-lg font-semibold text-slate-800 break-words">
                        {user.name}
                    </div>
                    <div className="text-sm text-slate-500 break-all">
                        {user.email}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {(user.roles ?? []).map((role) => (
                            <span
                                key={role}
                                className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600"
                            >
                                {ROLES_NAMES[
                                    role as keyof typeof ROLES_NAMES
                                ] || role}
                            </span>
                        ))}
                        {(user.perms ?? []).map((perm) => {
                            const meta = permissions[perm];
                            const label = meta?.description ?? perm;
                            const description = meta?.description;

                            return (
                                <span
                                    key={perm}
                                    title={
                                        description
                                            ? `${label}: ${description}`
                                            : label
                                    }
                                    className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                                >
                                    {label}
                                </span>
                            );
                        })}
                    </div>
                </div>
                {!isSelf ? (
                    <div className="flex justify-between flex-wrap gap-2 sm:flex-nowrap sm:flex-shrink-0">
                        {isRankHigher && (
                            <Button
                                primaryNoBackground
                                className="text-sm whitespace-nowrap"
                                onClick={() => {
                                    if (isSelf) return;
                                    setIsOpen((prev) => !prev);
                                }}
                            >
                                {isOpen ? (
                                    <Icon
                                        icon="mdi:eye-off"
                                        className="h-6 w-6"
                                    />
                                ) : (
                                    <Icon icon="mdi:pen" className="h-6 w-6" />
                                )}
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                dangerNoBackground
                                className="p-1"
                                disabled={isDeleting}
                                onClick={async () => {
                                    onRequestDelete(user);
                                }}
                            >
                                {isDeleting ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    <Icon
                                        icon="mdi:trash"
                                        className="h-6 w-6"
                                    />
                                )}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex-shrink-0 rounded-full border border-indigo-600 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
                        Вы
                    </div>
                )}
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-[1400px] opacity-100" : "max-h-0 opacity-0"
                }`}
                aria-hidden={!isOpen}
            >
                <div
                    className={`mt-5 border-t border-slate-100 pt-5 transition-transform duration-300 ${isOpen ? "translate-y-0" : "-translate-y-2"}`}
                >
                    <AdminUserRolesForm
                        user={user}
                        roles={roles}
                        permissions={permissions}
                        rolePermissionsMap={rolePermissionsMap}
                        maxRoleRank={maxRoleRank}
                        isSelf={isSelf}
                        onSaveRoles={(roles) => onSaveRoles(user.id, roles)}
                        onSavePermissions={(perms) =>
                            onSavePermissions(user.id, perms)
                        }
                        canAssignPermissions={canAssignPermissions}
                    />
                </div>
            </div>
        </div>
    );
};
