import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";

import { Button, Modal } from "../../atoms";
import { DataInformalBlock } from "../../molecules/general";

import { TeacherGroupCard } from "../../molecules/cards/teacher";
import { TeacherGroupModal } from "../../molecules/modals/teacher/TeacherGroupModal";
import { TeacherGroupsFiltersPanel } from "../../molecules/filters/teacher/TeacherGroupsFiltersPanel";
import { RegisterForm } from "../../molecules/forms/auth";
import { useToasts } from "../../../hooks/useToasts";
import {
    useTeacherGroupsAPI,
    useTeacherGroupsManage,
} from "../../../hooks/teacher/groups";

import type { RegisterFormPayload } from "../../molecules/forms/auth/RegisterForm";
import type {
    TeacherUserGroup,
    TeacherUserOption,
} from "../../../types/teacher/TeacherUsers";

export const TeacherUsersPage = observer(() => {
    const [groupModalMode, setGroupModalMode] = useState<
        "create" | "register" | "rename" | null
    >(null);
    const [isRegisterUserModalOpen, setIsRegisterUserModalOpen] =
        useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: number;
        name: string;
        email: string;
    } | null>(null);
    const [createdUsers, setCreatedUsers] = useState<TeacherUserOption[]>([]);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [renameGroupId, setRenameGroupId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");
    const [registerGroupId, setRegisterGroupId] = useState<number | null>(null);
    const [addingUsers, setAddingUsers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { toast } = useToasts();
    const {
        usersAppliedFilters,
        groupsFilters,
        groupsAppliedFilters,
        updateGroupsFilters,
    } = useTeacherGroupsManage();
    const {
        groups,
        groupsLoading,
        groupsError,
        groupsPagination,
        users,
        createGroup,
        isCreatingGroup,
        renameGroup,
        isRenamingGroup,
        addUsers,
        isAddingUsers,
        removeUser,
        isRemovingUser,
        deleteGroup,
        isDeletingGroup,
        createUser,
        isCreatingUser,
    } = useTeacherGroupsAPI({
        groups: groupsAppliedFilters,
        users: usersAppliedFilters,
    });

    const [searchValue, setSearchValue] = useState(groupsFilters.search ?? "");

    const mergedUsers = useMemo(() => {
        const map = new Map<number, TeacherUserOption>();
        users.forEach((user) => map.set(user.id, user));
        createdUsers.forEach((user) => map.set(user.id, user));
        return Array.from(map.values());
    }, [users, createdUsers]);

    const userOptions = useMemo(
        () =>
            mergedUsers.map((user) => ({
                value: String(user.id),
                label: user.name,
                description: user.email,
            })),
        [mergedUsers],
    );

    const selectedUsersPreview = useMemo(() => {
        const selected = new Set(selectedUsers);
        return mergedUsers.filter((user) => selected.has(String(user.id)));
    }, [selectedUsers, mergedUsers]);

    const registerGroup = useMemo(
        () => groups.find((group) => group.id === registerGroupId) ?? null,
        [groups, registerGroupId],
    );

    const renameGroupTarget = useMemo(
        () => groups.find((group) => group.id === renameGroupId) ?? null,
        [groups, renameGroupId],
    );

    const registerOptions = useMemo(() => {
        if (!registerGroup) return [];
        return userOptions.filter(
            (option) =>
                !registerGroup.participants.some(
                    (participant) => String(participant.id) === option.value,
                ),
        );
    }, [registerGroup, userOptions]);

    const isGroupModalOpen = groupModalMode !== null;

    const handleCloseGroupModal = () => {
        setGroupModalMode(null);
        setRegisterGroupId(null);
        setRenameGroupId(null);
        setEditingName("");
    };

    const handleRegisterUser = async (payload: RegisterFormPayload) => {
        try {
            const user = await createUser({
                name: payload.name,
                email: payload.email,
                password: payload.password,
                password_confirmation: payload.confirmPassword,
            });
            setCreatedUsers((prev) => {
                if (prev.some((item) => item.id === user.id)) return prev;
                return [...prev, user];
            });
            setAddingUsers((prev) =>
                Array.from(new Set([...prev, String(user.id)])),
            );
            setIsRegisterUserModalOpen(false);
            toast.success("Пользователь создан");
            return true;
        } catch (err: any) {
            toast.danger(
                err?.response?.data?.message ||
                    "Не удалось создать пользователя",
            );
            return false;
        }
    };

    useEffect(() => {
        const handle = window.setTimeout(() => {
            updateGroupsFilters({ search: searchValue });
        }, 300);
        return () => window.clearTimeout(handle);
    }, [searchValue, updateGroupsFilters]);

    const handleCreateGroup = async () => {
        const trimmedName = groupName.trim();
        if (!trimmedName) {
            setError("Укажите название группы");
            return;
        }

        try {
            await createGroup({
                name: trimmedName,
                user_ids: selectedUsers.map((id) => Number(id)),
            });
            setGroupName("");
            setSelectedUsers([]);
            setError(null);
            toast.success("Группа создана");
        } catch (err: any) {
            toast.danger(
                err?.response?.data?.message || "Не удалось создать группу",
            );
        }
    };

    const handleSaveRename = async (groupId: number) => {
        const trimmedName = editingName.trim();
        if (!trimmedName) {
            toast.danger("Название не может быть пустым");
            return;
        }
        try {
            await renameGroup({ groupId, payload: { name: trimmedName } });
            setRenameGroupId(null);
            setEditingName("");
            toast.success("Название обновлено");
            setGroupModalMode(null);
        } catch (err: any) {
            toast.danger(
                err?.response?.data?.message || "Не удалось обновить название",
            );
        }
    };

    const handleStartRename = (group: TeacherUserGroup) => {
        setRenameGroupId(group.id);
        setEditingName(group.name);
        setGroupModalMode("rename");
    };

    const handleAddUsers = async (groupId: number) => {
        if (!addingUsers.length) {
            toast.danger("Выберите пользователя");
            return;
        }
        try {
            await addUsers({
                groupId,
                payload: { user_ids: addingUsers.map((id) => Number(id)) },
            });
            setAddingUsers([]);
            setRegisterGroupId(null);
            toast.success("Пользователь добавлен");
        } catch (err: any) {
            toast.danger(
                err?.response?.data?.message ||
                    "Не удалось добавить пользователя",
            );
        }
    };

    const handleRemoveUser = async (groupId: number, userId: number) => {
        try {
            await removeUser({ groupId, userId });
            toast.success("Пользователь удалён из группы");
        } catch (err: any) {
            toast.danger(
                err?.response?.data?.message ||
                    "Не удалось удалить пользователя",
            );
        }
    };

    const handleDeleteGroup = async (groupId: number) => {
        try {
            await deleteGroup(groupId);
            toast.success("Группа удалена");
        } catch (err: any) {
            toast.danger(
                err?.response?.data?.message || "Не удалось удалить группу",
            );
        }
    };

    return (
        <div className="flex flex-col gap-4 lg:flex-row animate-fade-in">
            <div className="order-2 flex-1 space-y-4 lg:order-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="text-2xl font-semibold text-slate-800">
                                Группы
                            </div>
                            <div className="text-sm text-slate-500">
                                Создавайте группы для быстрого назначения
                                доступа и удобной работы с участниками.
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                primary
                                className="px-4 py-2 text-sm flex gap-2 items-center"
                                onClick={() => setGroupModalMode("create")}
                            >
                                <Icon
                                    icon="mdi:account-plus-outline"
                                    className="w-5 h-5 mr-2"
                                />
                                Добавить
                            </Button>
                        </div>
                    </div>
                </div>

                <DataInformalBlock
                    isLoading={groupsLoading}
                    isError={!!groupsError}
                    isEmpty={
                        groups.length === 0 && !groupsLoading && !groupsError
                    }
                    loadingMessage="Загрузка групп..."
                    errorMessage={groupsError || "Не удалось загрузить группы."}
                    emptyMessage="Групп не найдено."
                />

                {!groupsLoading && !groupsError && groups.length > 0 && (
                    <div className="grid gap-4">
                        {groups.map((group) => (
                            <TeacherGroupCard
                                key={group.id}
                                group={group}
                                isDeleting={
                                    isDeletingGroup &&
                                    deleteTarget?.id === group.id
                                }
                                isRemoving={isRemovingUser}
                                onStartRename={() => handleStartRename(group)}
                                onStartRegister={() => {
                                    setRegisterGroupId(group.id);
                                    setAddingUsers([]);
                                    setGroupModalMode("register");
                                }}
                                onDeleteGroup={() => {
                                    setDeleteTarget({
                                        id: group.id,
                                        name: group.name,
                                        email: "",
                                    });
                                    setIsDeleteModalOpen(true);
                                }}
                                onRemoveUser={(userId) =>
                                    handleRemoveUser(group.id, userId)
                                }
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="order-1 w-full shrink-0 lg:order-2 lg:max-w-sm">
                <TeacherGroupsFiltersPanel
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    pagination={groupsPagination}
                    isLoading={groupsLoading}
                    onPrevPage={() =>
                        updateGroupsFilters({
                            page: Math.max(1, groupsPagination.page - 1),
                        })
                    }
                    onNextPage={() =>
                        updateGroupsFilters({
                            page: groupsPagination.page + 1,
                        })
                    }
                    onReset={() => {
                        setSearchValue("");
                        updateGroupsFilters({ search: "", page: 1 });
                    }}
                />
            </div>
            {groupModalMode && (
                <TeacherGroupModal
                    open={isGroupModalOpen}
                    mode={groupModalMode}
                    onClose={handleCloseGroupModal}
                    groupName={groupName}
                    onGroupNameChange={setGroupName}
                    userOptions={userOptions}
                    selectedUsers={selectedUsers}
                    onSelectedUsersChange={setSelectedUsers}
                    selectedUsersPreview={selectedUsersPreview}
                    error={error}
                    onCreateGroup={handleCreateGroup}
                    isCreatingGroup={isCreatingGroup}
                    registerGroupName={registerGroup?.name ?? null}
                    registerOptions={registerOptions}
                    addingUsers={addingUsers}
                    onAddingUsersChange={setAddingUsers}
                    onOpenRegisterUser={() => setIsRegisterUserModalOpen(true)}
                    onAddUsers={() =>
                        registerGroup
                            ? handleAddUsers(registerGroup.id)
                            : undefined
                    }
                    isAddingUsers={isAddingUsers}
                    renameGroupName={renameGroupTarget?.name ?? null}
                    editingName={editingName}
                    onEditingNameChange={setEditingName}
                    onSaveRename={() =>
                        renameGroupTarget
                            ? handleSaveRename(renameGroupTarget.id)
                            : undefined
                    }
                    isRenamingGroup={isRenamingGroup}
                />
            )}
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title={
                    <h3 className="text-lg font-semibold text-slate-800">
                        Подтвердите удаление
                    </h3>
                }
                outsideClickClosing
            >
                <div className="space-y-4 mb-2">
                    <p className="text-sm text-slate-600">
                        Удалить группу{" "}
                        <span className="font-semibold text-slate-800">
                            {deleteTarget?.name}
                        </span>{" "}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 px-4 py-2 text-sm"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            danger
                            className="p-2"
                            isLoading={isDeletingGroup}
                            loadingText="Удаляем..."
                            onClick={() => {
                                if (deleteTarget) {
                                    handleDeleteGroup(deleteTarget.id);
                                    setIsDeleteModalOpen(false);
                                }
                            }}
                            disabled={isDeletingGroup}
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </Modal>
            <Modal
                open={isRegisterUserModalOpen}
                onClose={() => setIsRegisterUserModalOpen(false)}
                zIndexClassName="z-50"
                title={
                    <h3 className="text-lg font-semibold text-slate-800">
                        Регистрация пользователя
                    </h3>
                }
                outsideClickClosing
            >
                <RegisterForm
                    submitLabel="Создать"
                    onSubmit={handleRegisterUser}
                    isLoading={isCreatingUser}
                    className="w-full bg-slate-50 p-2"
                    onSuccess={() => setIsRegisterUserModalOpen(false)}
                />
            </Modal>
        </div>
    );
});
