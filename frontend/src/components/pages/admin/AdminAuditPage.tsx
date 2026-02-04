import { useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { Spinner } from "../../atoms";
import { useAdminAudit, useAdminAuditManage } from "../../../hooks/admin/audit";
import { AdminService } from "../../../services/admin";
import { AdminAuditFiltersPanel } from "../../molecules/filters/admin/AdminAuditFiltersPanel";
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
        <div className="flex flex-col gap-4 lg:flex-row animate-fade-in">
            <div className="order-2 flex-1 space-y-4 lg:order-1">
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
            <div className="order-1 w-full shrink-0 lg:order-2 lg:max-w-sm">
                <AdminAuditFiltersPanel
                    actionValue={filters.action_type ?? ""}
                    actionOptions={actionOptions}
                    onActionChange={(value) =>
                        updateFilters({
                            action_type: value as AdminAuditActionType,
                        })
                    }
                    dateFrom={filters.date_from ?? ""}
                    dateTo={filters.date_to ?? ""}
                    onDateFromChange={(value) =>
                        updateFilters({ date_from: value })
                    }
                    onDateToChange={(value) =>
                        updateFilters({ date_to: value })
                    }
                    pagination={pagination}
                    isLoading={isLoading}
                    isDownloading={isDownloading}
                    onPrevPage={handlePrevPage}
                    onNextPage={handleNextPage}
                    onDownload={handleDownload}
                    onReset={() =>
                        updateFilters({
                            action_type: "",
                            date_from: "",
                            date_to: "",
                        })
                    }
                />
            </div>
        </div>
    );
});
