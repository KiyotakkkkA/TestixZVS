import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { Button } from "../../../atoms";

import type { AdminAuditRecord } from "../../../../types/admin/AdminAudit";

export type AdminAuditTestAccessUpdatedCardProps = {
    record: AdminAuditRecord;
};

const statusMeta: Record<string, { icon: string; className: string }> = {
    all: {
        icon: "mdi:earth",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    auth: {
        icon: "mdi:account-check",
        className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    },
    custom: {
        icon: "mdi:account-cog",
        className: "bg-yellow-50 text-yellow-700 ring-yellow-200",
    },
    unknown: {
        icon: "mdi:help",
        className: "bg-slate-50 text-slate-500 ring-slate-200",
    },
};

const statusLabel = (value?: string) => {
    switch (value) {
        case "auth":
            return "Только авторизованные пользователи";
        case "custom":
            return "Настраиваемое ограничение";
        case "all":
            return "Все пользователи";
        default:
            return "Неизвестно";
    }
};

export const AdminAuditTestAccessUpdatedCard = ({
    record,
}: AdminAuditTestAccessUpdatedCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const test = record.new_object_state?.test ?? record.old_object_state?.test;

    const oldAccess = record.old_object_state?.access;
    const newAccess = record.new_object_state?.access;

    const oldUsers = useMemo(() => oldAccess?.users ?? [], [oldAccess?.users]);
    const newUsers = useMemo(() => newAccess?.users ?? [], [newAccess?.users]);

    const oldStatusKey = oldAccess?.status ?? "unknown";
    const newStatusKey = newAccess?.status ?? "unknown";
    const oldStatusDetails = statusMeta[oldStatusKey] ?? statusMeta.unknown;
    const newStatusDetails = statusMeta[newStatusKey] ?? statusMeta.unknown;

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset bg-indigo-50 text-indigo-700 ring-indigo-200">
                            <Icon icon="mdi:lock-check" className="h-4 w-4" />
                        </span>
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-2 py-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Было
                            </span>
                            <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset ${oldStatusDetails.className}`}
                            >
                                <Icon
                                    icon={oldStatusDetails.icon}
                                    className="h-4 w-4"
                                />
                            </span>
                            <span className="mx-1 h-4 w-px bg-slate-200" />
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Стало
                            </span>
                            <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset ${newStatusDetails.className}`}
                            >
                                <Icon
                                    icon={newStatusDetails.icon}
                                    className="h-4 w-4"
                                />
                            </span>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            Доступ к тесту
                        </span>
                        <span className="text-xs text-slate-400">
                            {new Date(record.created_at).toLocaleString(
                                "ru-RU",
                            )}
                        </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                        Автор:{" "}
                        <span className="font-semibold text-slate-800">
                            {record.actor?.name ?? "—"}
                        </span>
                        {record.actor?.email && (
                            <span className="text-slate-400">
                                {" "}
                                ({record.actor.email})
                            </span>
                        )}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                        Тест:{" "}
                        <span className="font-semibold text-slate-800">
                            {test?.title ?? "—"}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                    <Button
                        primaryNoBackground
                        className="text-sm whitespace-nowrap"
                        onClick={() => setIsOpen((prev) => !prev)}
                    >
                        {isOpen ? (
                            <Icon icon="mdi:eye-off" className="h-6 w-6" />
                        ) : (
                            <Icon icon="mdi:eye" className="h-6 w-6" />
                        )}
                    </Button>
                </div>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
                }`}
                aria-hidden={!isOpen}
            >
                <div
                    className={`mt-5 border-t border-slate-100 pt-5 transition-transform duration-300 ${isOpen ? "translate-y-0" : "-translate-y-2"}`}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Было
                            </div>
                            <div className="mt-2 text-sm text-slate-700">
                                {statusLabel(oldAccess?.status)}
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                Пользователей: {oldUsers.length}
                            </div>
                            {oldUsers.length > 0 && (
                                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                                    {oldUsers.map((user) => (
                                        <li key={user.id}>
                                            {user.name} ({user.email})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="rounded-lg">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Стало
                            </div>
                            <div className="mt-2 text-sm text-slate-700">
                                {statusLabel(newAccess?.status)}
                            </div>
                            <div className="mt-2 text-xs text-slate-400">
                                Пользователей: {newUsers.length}
                            </div>
                            {newUsers.length > 0 && (
                                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                                    {newUsers.map((user) => (
                                        <li key={user.id}>
                                            {user.name} ({user.email})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
