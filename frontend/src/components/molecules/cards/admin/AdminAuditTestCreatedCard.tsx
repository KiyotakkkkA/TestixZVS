import { Icon } from "@iconify/react";

import { Button } from "../../../atoms";

import type { AdminAuditRecord } from "../../../../types/admin/AdminAudit";

export type AdminAuditTestCreatedCardProps = {
    record: AdminAuditRecord;
};

export const AdminAuditTestCreatedCard = ({
    record,
}: AdminAuditTestCreatedCardProps) => {
    const test = record.new_object_state?.test;

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset bg-sky-50 text-sky-700 ring-sky-200">
                            <Icon icon="mdi:file-plus" className="h-4 w-4" />
                        </span>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                            Тест создан
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
                {test?.link && (
                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                        <Button
                            secondary
                            className="px-3 py-1.5 text-xs"
                            to={test.link}
                        >
                            Открыть
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
