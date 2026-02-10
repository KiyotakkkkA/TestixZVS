import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";

import { AdminUserCard } from "../../molecules/cards/admin";
import { authStore } from "../../../stores/authStore";
import { ROLE_RANKS, ROLES_NAMES } from "../../../data/admin";
import { Button, Modal } from "../../atoms";
import { RegisterForm } from "../../molecules/forms/auth";
import { AdminUsersFiltersPanel } from "../../molecules/filters/admin";
import {
    useAdminUsersAPI,
    useAdminUsersManage,
} from "../../../hooks/admin/users";
import { useToasts } from "../../../hooks/useToasts";
import { DataInformalBlock } from "../../molecules/shared";

export const AdminUsersPage = observer(() => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<null | {
        id: number;
        name: string;
        email: string;
    }>(null);
    const { toast } = useToasts();
    const { filters, appliedFilters, updateFilters } = useAdminUsersManage();
    const {
        users,
        roles,
        permissions,
        pagination,
        isLoading,
        error,
        createUser,
        isAdding,
        deleteUser,
        deletingIds,
        updateUserRoles,
        updateUserPermissions,
    } = useAdminUsersAPI(appliedFilters);

    const [searchValue, setSearchValue] = useState(filters.search ?? "");

    const canAssignPermissions = authStore.hasPermissions([
        "assign permissions",
    ]);
    const canAddUsers = authStore.hasPermissions(["add users"]);
    const canRemoveUsers = authStore.hasPermissions(["remove users"]);
    const canAssignAdmin = authStore.hasPermissions(["assign admin role"]);
    const canAssignEditor = authStore.hasPermissions(["assign editor role"]);

    const actorRank = Math.max(
        -1,
        ...(authStore.user?.roles ?? []).map((role) => ROLE_RANKS[role] ?? -1),
    );

    const rolePermissionsMap = useMemo(() => {
        const map: Record<string, string[]> = {};
        roles.forEach((role) => {
            map[role.name] = role.permissions ?? [];
        });
        return map;
    }, [roles]);

    const roleOptions = useMemo(
        () => [
            { value: "", label: "Все роли" },
            ...roles.map((role) => ({
                value: role.name,
                label:
                    ROLES_NAMES[role.name as keyof typeof ROLES_NAMES] ||
                    role.name,
            })),
        ],
        [roles],
    );

    const permissionOptions = useMemo(
        () =>
            Object.values(permissions).map((perm) => ({
                value: perm.name,
                label: perm.name,
                description: perm.description,
            })),
        [permissions],
    );

    useEffect(() => {
        const handle = window.setTimeout(() => {
            updateFilters({ search: searchValue });
        }, 300);
        return () => window.clearTimeout(handle);
    }, [searchValue, updateFilters]);

    const handleSaveRoles = async (userId: number, nextRoles: string[]) => {
        try {
            await updateUserRoles(userId, nextRoles);
            toast.success("Роли пользователя сохранены");
        } catch (error: any) {
            toast.danger(
                error?.response?.data?.message || "Не удалось сохранить роли",
            );
        }
    };

    const handleSavePermissions = async (
        userId: number,
        nextPerms: string[],
    ) => {
        try {
            await updateUserPermissions(userId, nextPerms);
            toast.success("Права пользователя сохранены");
        } catch (error: any) {
            toast.danger(
                error?.response?.data?.message || "Не удалось сохранить права",
            );
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await deleteUser(userId);
            toast.success("Пользователь удалён");
        } catch (error: any) {
            toast.danger(
                error?.response?.data?.message ||
                    "Не удалось удалить пользователя",
            );
        }
    };

    const handleRequestDelete = (user: {
        id: number;
        name: string;
        email: string;
    }) => {
        setDeleteTarget(user);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        await handleDeleteUser(deleteTarget.id);
        setDeleteTarget(null);
    };

    const handleResetFilters = () => {
        setSearchValue("");
        updateFilters({ search: "", role: "", permissions: [], page: 1 });
    };

    const handleCreateUser = async (payload: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        try {
            await createUser({
                name: payload.name,
                email: payload.email,
                password: payload.password,
                password_confirmation: payload.confirmPassword,
                role: "user",
            });
            setIsAddModalOpen(false);
            toast.success("Пользователь создан");
            return true;
        } catch {
            toast.danger("Не удалось создать пользователя");
            return false;
        } finally {
        }
    };

    return (
        <>
            <div className="flex flex-col gap-4 lg:flex-row animate-fade-in">
                <div className="order-2 flex-1 space-y-4 lg:order-1">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                        <div className="flex flex-col gap-3 md:items-start sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="text-2xl font-semibold text-slate-800">
                                    Пользователи
                                </div>
                                <div className="text-sm text-slate-500">
                                    Управляйте ролями и правами пользователей.
                                </div>
                            </div>
                            {canAddUsers && (
                                <div className="mt-4">
                                    <Button
                                        primary
                                        className="px-4 py-2 text-sm flex gap-2 items-center"
                                        onClick={() => setIsAddModalOpen(true)}
                                    >
                                        <Icon
                                            icon="mdi:account-plus-outline"
                                            className="w-5 h-5 mr-2"
                                        />
                                        Добавить
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <DataInformalBlock
                        isLoading={isLoading}
                        isError={!!error}
                        isEmpty={users.length === 0 && !isLoading && !error}
                        loadingMessage="Загрузка пользователей..."
                        errorMessage={
                            error || "Не удалось загрузить пользователей."
                        }
                        emptyMessage="Пользователей не найдено."
                    />

                    {!isLoading && !error && users.length > 0 && (
                        <div className="grid gap-4">
                            {users.map((user) => {
                                const isSelf = authStore.user?.id === user.id;
                                const targetRank = Math.max(
                                    -1,
                                    ...(user.roles ?? []).map(
                                        (role) => ROLE_RANKS[role] ?? -1,
                                    ),
                                );
                                const maxRoleRank = Math.max(actorRank, -1);
                                const canDelete = Boolean(
                                    !isSelf &&
                                    canRemoveUsers &&
                                    targetRank <= actorRank &&
                                    (!user.roles.includes("editor") ||
                                        canAssignEditor) &&
                                    (!user.roles.includes("admin") ||
                                        canAssignAdmin) &&
                                    (!user.roles.includes("root") ||
                                        authStore.user?.roles.includes("root")),
                                );

                                return (
                                    <AdminUserCard
                                        key={user.id}
                                        user={user}
                                        roles={roles}
                                        permissions={permissions}
                                        rolePermissionsMap={rolePermissionsMap}
                                        maxRoleRank={maxRoleRank}
                                        isSelf={isSelf}
                                        isRankHigher={actorRank > targetRank}
                                        canDelete={canDelete}
                                        isDeleting={Boolean(
                                            deletingIds[user.id],
                                        )}
                                        onRequestDelete={handleRequestDelete}
                                        onSaveRoles={handleSaveRoles}
                                        onSavePermissions={
                                            handleSavePermissions
                                        }
                                        canAssignPermissions={
                                            canAssignPermissions
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="order-1 w-full shrink-0 lg:order-2 lg:max-w-sm">
                    <AdminUsersFiltersPanel
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        roleValue={filters.role ?? ""}
                        roleOptions={roleOptions}
                        onRoleChange={(value) => updateFilters({ role: value })}
                        permissionOptions={permissionOptions}
                        permissionValue={filters.permissions ?? []}
                        onPermissionChange={(value) =>
                            updateFilters({ permissions: value })
                        }
                        pagination={pagination}
                        isLoading={isLoading}
                        onPrevPage={() =>
                            updateFilters({ page: pagination.page - 1 })
                        }
                        onNextPage={() =>
                            updateFilters({ page: pagination.page + 1 })
                        }
                        onReset={handleResetFilters}
                    />
                </div>
            </div>
            <Modal
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                title={
                    <h3 className="text-lg font-semibold text-slate-800">
                        Подтвердите удаление
                    </h3>
                }
                outsideClickClosing
            >
                <div className="space-y-4 mb-2">
                    <p className="text-sm text-slate-600">
                        Удалить пользователя{" "}
                        <span className="font-semibold text-slate-800">
                            {deleteTarget?.name}
                        </span>{" "}
                        ({deleteTarget?.email})?
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 px-4 py-2 text-sm"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Отмена
                        </Button>
                        <Button
                            danger
                            className="p-2"
                            onClick={handleConfirmDelete}
                            isLoading={
                                deleteTarget
                                    ? Boolean(deletingIds[deleteTarget.id])
                                    : false
                            }
                            loadingText="Удаляем..."
                            disabled={
                                deleteTarget
                                    ? Boolean(deletingIds[deleteTarget.id])
                                    : false
                            }
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={
                    <h3 className="text-lg font-semibold text-slate-800">
                        Создание пользователя
                    </h3>
                }
            >
                <RegisterForm
                    submitLabel="Создать"
                    onSubmit={handleCreateUser}
                    isLoading={isAdding}
                    className="w-full bg-slate-50 p-2"
                    onSuccess={() => setIsAddModalOpen(false)}
                />
            </Modal>
        </>
    );
});
