import { useEffect, useMemo, useState } from 'react';

import { InputCheckbox, Button, Spinner } from '../../atoms';
import { ROLE_RANKS } from '../../../data/admin';
import { authStore } from '../../../stores/authStore';

import type { User } from '../../../types/User';
import type { AdminPermissionsResponse, RoleOption } from '../../../types/admin/AdminUsers';

export type UserRolesFormProps = {
  user: User;
  roles: RoleOption[];
  permissions: AdminPermissionsResponse['permissions'];
  rolePermissionsMap: Record<string, string[]>;
  maxRoleRank: number;
  isSelf: boolean;
  onSaveRoles: (roles: string[]) => Promise<void>;
  onSavePermissions: (perms: string[]) => Promise<void>;
  canAssignPermissions: boolean;
};

export const UserRolesForm = ({
  user,
  roles,
  permissions,
  rolePermissionsMap,
  maxRoleRank,
  isSelf,
  onSaveRoles,
  onSavePermissions,
  canAssignPermissions,
}: UserRolesFormProps) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles ?? []);
  const [selectedPerms, setSelectedPerms] = useState<string[]>(user.perms ?? []);
  const [savingRoles, setSavingRoles] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  const roleOptions = useMemo(() => roles.filter((role) => role?.name), [roles]);
  const permOptions = useMemo(() => Object.keys(permissions).filter(Boolean), [permissions]);

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
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  return (
    <div className="flex flex-col gap-5">
        <div className='px-2'>
            <div className="text-xs uppercase text-slate-400">Роли</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roleOptions.map((role) => {
                if (role.name === 'root') return null;
                const roleRank = ROLE_RANKS[role.name] ?? -1;
                const disabled = isSelf || roleRank > maxRoleRank;

                if (role.name === 'admin' && !authStore.hasPermission('assign admin role')) return null;
                if (role.name === 'editor' && !authStore.hasPermission('assign editor role')) return null;
                if (role.name === 'user' && !authStore.hasPermission('add users')) return null;

                return (
                <label key={role.name} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${disabled ? 'bg-slate-50 text-slate-400' : 'bg-white'} hover:ring-2 hover:ring-indigo-200 cursor-pointer`}>
                    <span>{role.name}</span>
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
                    <span className="inline-flex items-center gap-2">
                      {savingRoles && <Spinner className="h-4 w-4" />}
                      Сохранить роли
                    </span>
                </Button>
            </div>
        </div>

        {
            authStore.hasPermission('assign permissions') && (
                <div className='p-2'>
                    <div className="text-xs uppercase text-slate-400">Права</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {permOptions.map((perm) => {
                            const disabled = !canAssignPermissions || isSelf;
                            const meta = permissions[perm];
                            const label = meta?.description ?? '[ОШИБКА]';
                            const sublabel = meta?.name;

                            return (
                            <label key={perm} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${disabled ? 'bg-slate-50 text-slate-400' : 'bg-white'} hover:ring-2 hover:ring-indigo-200 cursor-pointer`}>
                                <span className="flex min-w-0 flex-col">
                                  <span className="truncate">{label}</span>
                                  {sublabel && (
                                    <span className="text-xs text-slate-400 truncate">{sublabel}</span>
                                  )}
                                </span>
                                <InputCheckbox
                                    checked={selectedPerms.includes(perm)}
                                    onChange={() => {
                                        if (disabled) return;
                                        togglePerm(perm);
                                    }}
                                />
                            </label>
                            );
                    })}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            secondary
                            className="px-4 py-2 text-sm"
                            disabled={savingPerms || !canAssignPermissions || isSelf}
                            onClick={async () => {
                                setSavingPerms(true);
                                try {
                                    await onSavePermissions(selectedPerms);
                                } finally {
                                    setSavingPerms(false);
                                }
                            }}
                        >
                            <span className="inline-flex items-center gap-2">
                              {savingPerms && <Spinner className="h-4 w-4" />}
                              Сохранить права
                            </span>
                        </Button>
                    </div>
                </div>
            )
        }
    </div>
  );
};
