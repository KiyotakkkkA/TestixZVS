import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

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
    { value: "link", label: "По ссылке" },
];

const statusMeta: Record<
    AdminTestsAccessStatus,
    { label: string; icon: string; className: string }
> = {
    all: {
        label: "Доступен всем",
        icon: "mdi:earth",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    auth: {
        label: "Только авторизованные",
        icon: "mdi:account-check",
        className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    },
    protected: {
        label: "Выборочно",
        icon: "mdi:lock-check",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    link: {
        label: "По ссылке",
        icon: "mdi:link-variant",
        className: "bg-sky-50 text-sky-700 ring-sky-200",
    },
};

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
    const [copied, setCopied] = useState(false);

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

    const accessLink = useMemo(() => {
        if (!test.access_link) return null;
        if (typeof window === "undefined") return test.access_link;
        return `${window.location.origin}/tests/${test.id}/start?access_link=${test.access_link}`;
    }, [test.access_link, test.id]);

    const handleCopy = async () => {
        if (!accessLink) return;
        try {
            await navigator.clipboard.writeText(accessLink);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    };

    const statusDetails = statusMeta[test.access_status];

    if (isUpdating) {
        return (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <Spinner className="h-8 w-8 text-slate-400" />
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <div className="text-lg font-semibold text-slate-800 break-words">
                        {test.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                        Вопросов:{" "}
                        {test.total_questions - (test.total_disabled ?? 0)}
                    </div>
                    <div className="mt-3">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusDetails.className}`}
                        >
                            <Icon
                                icon={statusDetails.icon}
                                className="h-4 w-4"
                            />
                            {statusDetails.label}
                        </span>
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

            {test.access_status === "link" && (
                <div className="mt-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Ссылка
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 break-all">
                            {accessLink ?? "Ссылка не сгенерирована"}
                        </div>
                        {accessLink && (
                            <Button
                                disabled={copied}
                                secondary
                                className="px-4 py-2 text-sm"
                                onClick={handleCopy}
                            >
                                {copied ? "Скопировано" : "Скопировать"}
                            </Button>
                        )}
                    </div>
                </div>
            )}

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
                                isLoading={isSavingUsers}
                                loadingText="Сохраняем..."
                                disabled={
                                    !hasUsersChanges ||
                                    isSavingUsers ||
                                    Boolean(isUpdating)
                                }
                                onClick={handleUsersSave}
                            >
                                Сохранить доступ
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
