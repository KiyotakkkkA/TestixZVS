import { Icon } from "@iconify/react";

import {
    ArrayAutoFillSelector,
    Button,
    InputSmall,
    Modal,
} from "../../../atoms";

import type { ArrayAutoFillOption } from "../../../atoms/ArrayAutoFillSelector";
import type { TeacherUserOption } from "../../../../types/teacher/TeacherUsers";

type TeacherGroupModalMode = "create" | "register" | "rename";

type TeacherGroupModalProps = {
    open: boolean;
    mode: TeacherGroupModalMode;
    onClose: () => void;
    groupName: string;
    onGroupNameChange: (value: string) => void;
    userOptions: ArrayAutoFillOption[];
    selectedUsers: string[];
    onSelectedUsersChange: (value: string[]) => void;
    selectedUsersPreview: TeacherUserOption[];
    error: string | null;
    onCreateGroup: () => void;
    isCreatingGroup: boolean;
    registerGroupName: string | null;
    registerOptions: ArrayAutoFillOption[];
    addingUsers: string[];
    onAddingUsersChange: (value: string[]) => void;
    onOpenRegisterUser: () => void;
    onAddUsers: () => void;
    isAddingUsers: boolean;
    renameGroupName: string | null;
    editingName: string;
    onEditingNameChange: (value: string) => void;
    onSaveRename: () => void;
    isRenamingGroup: boolean;
};

export const TeacherGroupModal = ({
    open,
    mode,
    onClose,
    groupName,
    onGroupNameChange,
    userOptions,
    selectedUsers,
    onSelectedUsersChange,
    selectedUsersPreview,
    error,
    onCreateGroup,
    isCreatingGroup,
    registerGroupName,
    registerOptions,
    addingUsers,
    onAddingUsersChange,
    onOpenRegisterUser,
    onAddUsers,
    isAddingUsers,
    renameGroupName,
    editingName,
    onEditingNameChange,
    onSaveRename,
    isRenamingGroup,
}: TeacherGroupModalProps) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                <h3 className="text-lg font-semibold text-slate-800">
                    {mode === "create"
                        ? "Создать группу"
                        : mode === "register"
                          ? "Регистрация участников"
                          : "Редактировать группу"}
                </h3>
            }
            outsideClickClosing
        >
            {mode === "create" && (
                <div className="space-y-4 pb-2">
                    <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Название группы
                        </div>
                        <InputSmall
                            value={groupName}
                            onChange={(event) =>
                                onGroupNameChange(event.target.value)
                            }
                            placeholder="Например: Поток 2026"
                            className="p-2"
                        />
                    </div>
                    <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Участники
                        </div>
                        <ArrayAutoFillSelector
                            options={userOptions}
                            value={selectedUsers}
                            onChange={onSelectedUsersChange}
                            placeholder="Введите имя или email"
                        />
                        <div className="mt-2 text-xs text-slate-400">
                            Выбрано: {selectedUsers.length}
                        </div>
                    </div>
                    {selectedUsersPreview.length > 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Состав группы
                            </div>
                            <div className="mt-2 space-y-2">
                                {selectedUsersPreview.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-700">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {user.email}
                                            </div>
                                        </div>
                                        <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-600">
                                            участник
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {error}
                        </div>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 px-4 py-2 text-sm"
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Button
                            primary
                            className="px-4 py-2 text-sm"
                            isLoading={isCreatingGroup}
                            loadingText="Создаем..."
                            onClick={onCreateGroup}
                            disabled={isCreatingGroup}
                        >
                            Создать группу
                        </Button>
                    </div>
                </div>
            )}
            {mode === "register" && (
                <div className="space-y-4 pb-2">
                    <div>
                        <div className="text-sm font-semibold text-slate-800">
                            {registerGroupName}
                        </div>
                        <div className="text-xs text-slate-400">
                            Выберите пользователей для регистрации в группе.
                        </div>
                    </div>
                    <div className="flex gap-2 items-start">
                        <div className="flex-1">
                            <ArrayAutoFillSelector
                                options={registerOptions}
                                value={addingUsers}
                                onChange={onAddingUsersChange}
                                placeholder="Введите имя или email"
                            />
                        </div>
                        <Button
                            primary
                            className="p-[0.65rem]"
                            onClick={onOpenRegisterUser}
                        >
                            <Icon icon="mdi:plus" className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="text-xs text-slate-400">
                        Выбрано: {addingUsers.length}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 px-4 py-2 text-sm"
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Button
                            primary
                            className="px-4 py-2 text-sm"
                            isLoading={isAddingUsers}
                            loadingText="Добавляем..."
                            onClick={onAddUsers}
                            disabled={isAddingUsers}
                        >
                            Добавить
                        </Button>
                    </div>
                </div>
            )}
            {mode === "rename" && (
                <div className="space-y-4 pb-2">
                    <div>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Новое название
                        </div>
                        <InputSmall
                            value={editingName}
                            onChange={(event) =>
                                onEditingNameChange(event.target.value)
                            }
                            className="p-2"
                        />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 px-4 py-2 text-sm"
                            onClick={onClose}
                        >
                            Отмена
                        </Button>
                        <Button
                            primary
                            className="px-4 py-2 text-sm"
                            isLoading={isRenamingGroup}
                            loadingText="Сохраняем..."
                            onClick={onSaveRename}
                            disabled={isRenamingGroup}
                        >
                            Сохранить
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
