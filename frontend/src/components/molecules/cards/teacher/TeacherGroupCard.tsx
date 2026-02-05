import { Icon } from "@iconify/react";

import { Button } from "../../../atoms";

import type { TeacherUserGroup } from "../../../../types/teacher/TeacherUsers";

type TeacherGroupCardProps = {
    group: TeacherUserGroup;
    isDeleting: boolean;
    isRemoving: boolean;
    onStartRename: () => void;
    onStartRegister: () => void;
    onDeleteGroup: () => void;
    onRemoveUser: (userId: number) => void;
};

export const TeacherGroupCard = ({
    group,
    isDeleting,
    isRemoving,
    onStartRename,
    onStartRegister,
    onDeleteGroup,
    onRemoveUser,
}: TeacherGroupCardProps) => {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex gap-2 items-center">
                        <div className="text-lg font-semibold text-slate-800 break-words">
                            {group.name}
                        </div>
                        <div className="bg-indigo-100 py-1 px-2 rounded-full border border-indigo-200 text-xs font-medium text-indigo-800">
                            {group.participants_count} участников
                        </div>
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                        Создано{" "}
                        {new Date(group.created_at).toLocaleString("ru-RU")}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 sm:flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            primaryNoBackground
                            className="text-sm"
                            onClick={onStartRename}
                        >
                            <Icon icon="mdi:pen" className="h-6 w-6" />
                        </Button>
                        <Button
                            dangerNoBackground
                            className="p-1"
                            isLoading={isDeleting}
                            disabled={isDeleting}
                            onClick={onDeleteGroup}
                        >
                            <Icon icon="mdi:trash" className="h-6 w-6" />
                        </Button>
                    </div>
                    <Button
                        primary
                        className="p-2 text-sm"
                        onClick={onStartRegister}
                    >
                        Зарегистрировать
                    </Button>
                </div>
            </div>
            {group.participants.length > 0 && (
                <div className="space-y-2 mt-4">
                    {group.participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-600"
                        >
                            <div>
                                <div className="text-sm font-medium text-slate-700">
                                    {participant.name}
                                </div>
                                <div className="text-xs text-slate-400">
                                    {participant.email}
                                </div>
                            </div>
                            <Button
                                dangerNoBackground
                                isLoading={isRemoving}
                                onClick={() => onRemoveUser(participant.id)}
                                disabled={isRemoving}
                            >
                                <Icon icon="mdi:trash" className="h-6 w-6" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
