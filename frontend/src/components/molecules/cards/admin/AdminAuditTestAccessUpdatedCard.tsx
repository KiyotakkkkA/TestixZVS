import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { Button } from "../../../atoms";

import type { AdminAuditRecord } from "../../../../types/admin/AdminAudit";

export type AdminAuditTestAccessUpdatedCardProps = {
    record: AdminAuditRecord;
};

const statusLabel = (value?: string) => {
    switch (value) {
        case "auth":
            return "Только авторизованные";
        case "protected":
            return "Выборочно";
        case "all":
        default:
            return "Доступен всем";
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

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
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
