import { useEffect, useMemo, useState } from "react";

import {
    ArrayAutoFillSelector,
    Button,
    Selector,
    Spinner,
} from "../../../atoms";

import type { ArrayAutoFillOption } from "../../../atoms/ArrayAutoFillSelector";
import type {
    AdminTestAccessItem,
    AdminTestsAccessStatus,
} from "../../../../types/admin/AdminTestsAccess";

type AdminTestAccessCardProps = {
    test: AdminTestAccessItem;
    userOptions: ArrayAutoFillOption[];
    isUpdating?: boolean;
    onStatusChange: (
        testId: string,
        status: AdminTestsAccessStatus,
    ) => Promise<void>;
    onUsersSave: (testId: string, userIds: number[]) => Promise<void>;
};

const statusOptions = [
    { value: "all", label: "Доступен всем" },
    { value: "auth", label: "Только авторизованные" },
    { value: "protected", label: "Выборочно" },
];

export const AdminTestAccessCard = ({
    test,
    userOptions,
    isUpdating,
    onStatusChange,
    onUsersSave,
}: AdminTestAccessCardProps) => {
    const initialUserIds = useMemo(
        () => test.access_users.map((user) => String(user.id)),
        [test.access_users],
    );
    const [selectedUserIds, setSelectedUserIds] =
        useState<string[]>(initialUserIds);
    const [isSavingUsers, setIsSavingUsers] = useState(false);

    useEffect(() => {
        setSelectedUserIds(initialUserIds);
    }, [initialUserIds]);

    const hasUsersChanges = useMemo(() => {
        if (selectedUserIds.length !== initialUserIds.length) return true;
        const set = new Set(initialUserIds);
        return selectedUserIds.some((id) => !set.has(id));
    }, [initialUserIds, selectedUserIds]);

    const handleUsersSave = async () => {
        const ids = selectedUserIds.map((value) => Number(value));
        setIsSavingUsers(true);
        try {
            await onUsersSave(test.id, ids);
        } finally {
            setIsSavingUsers(false);
        }
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <div className="text-lg font-semibold text-slate-800 break-words">
                        {test.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        Вопросов:{" "}
                        {test.total_questions - (test.total_disabled ?? 0)}
                    </div>
                </div>
                <div className="w-full md:w-64">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Видимость
                    </div>
                    <Selector
                        value={test.access_status}
                        options={statusOptions}
                        onChange={(value) =>
                            onStatusChange(
                                test.id,
                                value as AdminTestsAccessStatus,
                            )
                        }
                        disabled={Boolean(isUpdating)}
                    />
                </div>
            </div>

            {test.access_status === "protected" && (
                <div className="mt-5">
                    {" "}
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Разрешённые пользователи
                    </div>
                    <div className="space-y-3">
                        <ArrayAutoFillSelector
                            options={userOptions}
                            value={selectedUserIds}
                            onChange={setSelectedUserIds}
                            placeholder="Выберите пользователей"
                            disabled={Boolean(isUpdating)}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                primary
                                className="px-4 py-2 text-sm"
                                disabled={
                                    !hasUsersChanges ||
                                    isSavingUsers ||
                                    Boolean(isUpdating)
                                }
                                onClick={handleUsersSave}
                            >
                                {isSavingUsers ? (
                                    <Spinner className="h-4 w-4" />
                                ) : (
                                    "Сохранить доступ"
                                )}
                            </Button>
                            {hasUsersChanges && !isSavingUsers && (
                                <Button
                                    secondary
                                    className="px-4 py-2 text-sm"
                                    onClick={() =>
                                        setSelectedUserIds(initialUserIds)
                                    }
                                >
                                    Сбросить
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
