import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";

import { Button, InputDate, Selector, Spinner } from "../../atoms";
import { useAdminAudit, useAdminAuditManage } from "../../../hooks/admin/audit";
import { AdminService } from "../../../services/admin";
import {
    AdminAuditPermissionsChangeCard,
    AdminAuditRolesChangeCard,
    AdminAuditUserAddCard,
    AdminAuditUserRemoveCard,
    AdminAuditTestCreatedCard,
    AdminAuditTestUpdatedCard,
    AdminAuditTestDeletedCard,
    AdminAuditTestAccessUpdatedCard,
} from "../../molecules/cards/admin";

import type {
    AdminAuditActionType,
    AdminAuditRecord,
} from "../../../types/admin/AdminAudit";

export const AdminAuditPage = observer(() => {
    const { filters, appliedFilters, updateFilters } = useAdminAuditManage();
    const { records, pagination, isLoading, error } =
        useAdminAudit(appliedFilters);
    const [isDownloading, setIsDownloading] = useState(false);

    const actionOptions = useMemo(
        () => [
            { value: "", label: "Все события" },
            { value: "admin_roles_change", label: "Изменение ролей" },
            { value: "admin_permissions_change", label: "Изменение прав" },
            { value: "admin_user_add", label: "Добавление пользователя" },
            { value: "admin_user_remove", label: "Удаление пользователя" },
            { value: "test_created", label: "Создание теста" },
            { value: "test_updated", label: "Изменение теста" },
            { value: "test_deleted", label: "Удаление теста" },
            { value: "test_access_updated", label: "Доступ к тесту" },
        ],
        [],
    );

    const renderCard = (record: AdminAuditRecord) => {
        switch (record.action_type as AdminAuditActionType) {
            case "admin_roles_change":
                return (
                    <AdminAuditRolesChangeCard
                        key={record.id}
                        record={record}
                    />
                );
            case "admin_permissions_change":
                return (
                    <AdminAuditPermissionsChangeCard
                        key={record.id}
                        record={record}
                    />
                );
            case "admin_user_add":
                return (
                    <AdminAuditUserAddCard key={record.id} record={record} />
                );
            case "admin_user_remove":
                return (
                    <AdminAuditUserRemoveCard key={record.id} record={record} />
                );
            case "test_created":
                return (
                    <AdminAuditTestCreatedCard
                        key={record.id}
                        record={record}
                    />
                );
            case "test_updated":
                return (
                    <AdminAuditTestUpdatedCard
                        key={record.id}
                        record={record}
                    />
                );
            case "test_deleted":
                return (
                    <AdminAuditTestDeletedCard
                        key={record.id}
                        record={record}
                    />
                );
            case "test_access_updated":
                return (
                    <AdminAuditTestAccessUpdatedCard
                        key={record.id}
                        record={record}
                    />
                );
            default:
                return null;
        }
    };

    const normalizedFilters = useMemo(
        () => ({
            ...appliedFilters,
            action_type: appliedFilters.action_type || undefined,
            date_from: appliedFilters.date_from || undefined,
            date_to: appliedFilters.date_to || undefined,
            page: undefined,
            per_page: undefined,
        }),
        [appliedFilters],
    );

    const handleDownload = async () => {
        try {
            setIsDownloading(true);
            await AdminService.downloadAuditPdf(normalizedFilters);
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrevPage = () => {
        if (pagination.page <= 1) return;
        updateFilters({ page: pagination.page - 1 });
    };

    const handleNextPage = () => {
        if (pagination.page >= pagination.last_page) return;
        updateFilters({ page: pagination.page + 1 });
    };

    return (
        <div className="w-full space-y-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="text-2xl font-semibold text-slate-800">
                            Журнал аудита
                        </div>
                        <div className="text-sm text-slate-500">
                            Просмотр большинства событий, произошедших в
                            системе.
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Тип события
                            </div>
                            <Selector
                                value={filters.action_type ?? ""}
                                options={actionOptions}
                                onChange={(value) =>
                                    updateFilters({
                                        action_type:
                                            value as AdminAuditActionType,
                                    })
                                }
                            />
                        </div>
                        <InputDate
                            label="С"
                            value={filters.date_from ?? ""}
                            onChange={(event) =>
                                updateFilters({ date_from: event.target.value })
                            }
                        />
                        <InputDate
                            label="По"
                            value={filters.date_to ?? ""}
                            onChange={(event) =>
                                updateFilters({ date_to: event.target.value })
                            }
                        />
                    </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Button
                            secondary
                            className="w-full px-4 py-2 text-sm sm:w-auto"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={handlePrevPage}
                        >
                            Назад
                        </Button>
                        <div className="text-center text-sm text-slate-500 sm:text-left">
                            Страница{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.page}
                            </span>{" "}
                            из{" "}
                            <span className="font-semibold text-slate-700">
                                {pagination.last_page}
                            </span>
                        </div>
                        <Button
                            primary
                            className="w-full px-4 py-2 text-sm sm:w-auto"
                            disabled={
                                pagination.page >= pagination.last_page ||
                                isLoading
                            }
                            onClick={handleNextPage}
                        >
                            Вперёд
                        </Button>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Button
                            secondary
                            className="p-2"
                            onClick={handleDownload}
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Spinner className="h-4 w-4" />
                            ) : (
                                <Icon icon="mdi:download" className="h-5 w-5" />
                            )}
                        </Button>
                        <Button
                            dangerInverted
                            className="w-full px-4 py-2 text-sm sm:w-auto"
                            onClick={() =>
                                updateFilters({
                                    action_type: "",
                                    date_from: "",
                                    date_to: "",
                                })
                            }
                        >
                            Сбросить фильтры
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Загружаем журналы...
                    </div>
                </div>
            )}

            {!isLoading && error && (
                <div className="w-full rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {!isLoading && !error && records.length === 0 && (
                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Журнал пуст.
                </div>
            )}

            {!isLoading && !error && records.length > 0 && (
                <div className="grid gap-4">
                    {records.map((record) => renderCard(record))}
                </div>
            )}
        </div>
    );
});
