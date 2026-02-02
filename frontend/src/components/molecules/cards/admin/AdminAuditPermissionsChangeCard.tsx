import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { Button } from "../../../atoms";

import type { AdminAuditRecord } from "../../../../types/admin/AdminAudit";

export type AdminAuditPermissionsChangeCardProps = {
    record: AdminAuditRecord;
};

export const AdminAuditPermissionsChangeCard = ({
    record,
}: AdminAuditPermissionsChangeCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const target = useMemo(() => {
        return (
            record.new_object_state?.user ||
            record.old_object_state?.user ||
            null
        );
    }, [record]);

    const oldPerms = record.old_object_state?.permissions ?? [];
    const newPerms = record.new_object_state?.permissions ?? [];

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset bg-amber-50 text-amber-700 ring-amber-200">
                            <Icon icon="mdi:shield-key" className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Изменение прав
                        </span>
                        <span className="text-xs text-slate-400">
                            {new Date(record.created_at).toLocaleString(
                                "ru-RU",
                            )}
                        </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                        Администратор:{" "}
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
                        Пользователь:{" "}
                        <span className="font-semibold text-slate-800">
                            {target?.name ?? "—"}
                        </span>
                        {target?.email && (
                            <span className="text-slate-400">
                                {" "}
                                ({target.email})
                            </span>
                        )}
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
                    isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
                }`}
                aria-hidden={!isOpen}
            >
                <div
                    className={`mt-5 border-t border-slate-100 pt-5 transition-transform duration-300 ${isOpen ? "translate-y-0" : "-translate-y-2"}`}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Старые права
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {oldPerms.length ? (
                                    oldPerms.map((perm) => (
                                        <span
                                            key={perm}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600"
                                        >
                                            {perm}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400">
                                        Нет
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Новые права
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {newPerms.length ? (
                                    newPerms.map((perm) => (
                                        <span
                                            key={perm}
                                            className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                                        >
                                            {perm}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400">
                                        Нет
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
