import { useEffect, useMemo, useState } from "react";

import { InputCheckbox, Button } from "../../../atoms";
import {
    ROLE_RANKS,
    ROLES_NAMES,
    PERMISSION_GROUPS,
} from "../../../../data/admin";
import { authStore } from "../../../../stores/authStore";

import type { User } from "../../../../types/User";
import type {
    AdminPermissionsResponse,
    RoleOption,
} from "../../../../types/admin/AdminUsers";

export type AdminUserRolesFormProps = {
    user: User;
    roles: RoleOption[];
    permissions: AdminPermissionsResponse["permissions"];
    rolePermissionsMap: Record<string, string[]>;
    maxRoleRank: number;
    isSelf: boolean;
    onSaveRoles: (roles: string[]) => Promise<void>;
    onSavePermissions: (perms: string[]) => Promise<void>;
    canAssignPermissions: boolean;
};

export const AdminUserRolesForm = ({
    user,
    roles,
    permissions,
    rolePermissionsMap,
    maxRoleRank,
    isSelf,
    onSaveRoles,
    onSavePermissions,
    canAssignPermissions,
}: AdminUserRolesFormProps) => {
    const [selectedRoles, setSelectedRoles] = useState<string[]>(
        user.roles ?? [],
    );
    const [selectedPerms, setSelectedPerms] = useState<string[]>(
        user.perms ?? [],
    );
    const [savingRoles, setSavingRoles] = useState(false);
    const [savingPerms, setSavingPerms] = useState(false);

    const roleOptions = useMemo(
        () => roles.filter((role) => role?.name),
        [roles],
    );
    const permOptions = useMemo(
        () => Object.keys(permissions).filter(Boolean),
        [permissions],
    );

    useEffect(() => {
        setSelectedRoles(user.roles ?? []);
    }, [user.roles]);

    useEffect(() => {
        setSelectedPerms(user.perms ?? []);
    }, [user.perms]);

    const toggleRole = (role: string) => {
        const nextRoles = selectedRoles.includes(role) ? [] : [role];
        setSelectedRoles(nextRoles);

        if (nextRoles.length === 1) {
            const rolePerms = rolePermissionsMap[role] ?? [];
            setSelectedPerms(rolePerms);
        }
    };

    const togglePerm = (perm: string) => {
        setSelectedPerms((prev) =>
            prev.includes(perm)
                ? prev.filter((p) => p !== perm)
                : [...prev, perm],
        );
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="px-2">
                <div className="text-xs uppercase text-slate-400">Роли</div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {roleOptions.map((role) => {
                        if (role.name === "root") return null;
                        const roleRank = ROLE_RANKS[role.name] ?? -1;
                        const disabled = isSelf || roleRank > maxRoleRank;

                        if (
                            role.name === "admin" &&
                            !authStore.hasPermissions(["assign admin role"])
                        )
                            return null;
                        if (
                            role.name === "editor" &&
                            !authStore.hasPermissions(["assign editor role"])
                        )
                            return null;
                        if (
                            role.name === "user" &&
                            !authStore.hasPermissions(["add users"])
                        )
                            return null;

                        return (
                            <label
                                key={role.name}
                                className={`flex items-center justify-between rounded-lg bg-slate-100 border border-slate-300 px-3 py-2 text-sm ${disabled ? "text-slate-400" : ""} hover:ring-2 hover:ring-indigo-200 cursor-pointer`}
                            >
                                <span>
                                    {ROLES_NAMES[
                                        role.name as keyof typeof ROLES_NAMES
                                    ] || role.name}
                                </span>
                                <InputCheckbox
                                    checked={selectedRoles.includes(role.name)}
                                    onChange={() => {
                                        if (disabled) return;
                                        toggleRole(role.name);
                                    }}
                                    title={role.name}
                                />
                            </label>
                        );
                    })}
                </div>
                <div className="mt-3 flex justify-end">
                    <Button
                        secondary
                        className="px-4 py-2 text-sm"
                        isLoading={savingRoles}
                        loadingText="Сохраняем..."
                        disabled={savingRoles || isSelf}
                        onClick={async () => {
                            setSavingRoles(true);
                            try {
                                await onSaveRoles(selectedRoles);
                            } finally {
                                setSavingRoles(false);
                            }
                        }}
                    >
                        Сохранить роли
                    </Button>
                </div>
            </div>

            {authStore.hasPermissions(["assign permissions"]) && (
                <div className="p-2">
                    <div className="text-xs uppercase text-slate-400">
                        Права
                    </div>
                    <div className="mt-3 space-y-4">
                        {Object.entries(PERMISSION_GROUPS).map(
                            ([groupKey, group]) => {
                                const groupPerms = permOptions.filter((perm) =>
                                    group.permissions.includes(perm),
                                );

                                if (groupPerms.length === 0) return null;

                                return (
                                    <div
                                        key={groupKey}
                                        className="rounded-lg border border-slate-200 bg-slate-100 p-4"
                                    >
                                        <div className="mb-3 text-sm font-semibold text-slate-700">
                                            {group.title}
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {groupPerms.map((perm) => {
                                                const disabled =
                                                    !canAssignPermissions ||
                                                    isSelf;
                                                const meta = permissions[perm];
                                                const label =
                                                    meta?.description ??
                                                    "[ОШИБКА]";
                                                const sublabel = meta?.name;

                                                return (
                                                    <label
                                                        key={perm}
                                                        className={`flex items-center bg-slate-200 border border-slate-300 justify-between rounded-lg px-3 py-2 text-sm ${disabled ? "text-slate-400" : ""} hover:ring-2 hover:ring-indigo-200 cursor-pointer`}
                                                    >
                                                        <span className="flex min-w-0 flex-col">
                                                            <span className="truncate">
                                                                {label}
                                                            </span>
                                                            {sublabel && (
                                                                <span className="text-xs text-slate-400 truncate">
                                                                    {sublabel}
                                                                </span>
                                                            )}
                                                        </span>
                                                        <InputCheckbox
                                                            checked={selectedPerms.includes(
                                                                perm,
                                                            )}
                                                            onChange={() => {
                                                                if (disabled)
                                                                    return;
                                                                togglePerm(
                                                                    perm,
                                                                );
                                                            }}
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            secondary
                            className="px-4 py-2 text-sm"
                            isLoading={savingPerms}
                            loadingText="Сохраняем..."
                            disabled={
                                savingPerms || !canAssignPermissions || isSelf
                            }
                            onClick={async () => {
                                setSavingPerms(true);
                                try {
                                    await onSavePermissions(selectedPerms);
                                } finally {
                                    setSavingPerms(false);
                                }
                            }}
                        >
                            Сохранить права
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
