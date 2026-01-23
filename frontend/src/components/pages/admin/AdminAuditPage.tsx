import { useMemo } from "react";

import { Button, InputDate, Selector, Spinner } from "../../atoms";
import { useAdminAudit } from "../../../hooks/admin/useAdminAudit";
import {
    AdminAuditPermissionsChangeCard,
    AdminAuditRolesChangeCard,
    AdminAuditUserAddCard,
    AdminAuditUserRemoveCard,
} from "../../molecules/cards/admin";

import type { AdminAuditActionType, AdminAuditRecord } from "../../../types/admin/AdminAudit";

export const AdminAuditPage = () => {
    const { records, pagination, isLoading, error, filters, updateFilters } = useAdminAudit();

    const actionOptions = useMemo(
        () => [
            { value: "", label: "Все события" },
            { value: "admin_roles_change", label: "Изменение ролей" },
            { value: "admin_permissions_change", label: "Изменение прав" },
            { value: "admin_user_add", label: "Добавление пользователя" },
            { value: "admin_user_remove", label: "Удаление пользователя" },
        ],
        []
    );

    const renderCard = (record: AdminAuditRecord) => {
        switch (record.action_type as AdminAuditActionType) {
            case "admin_roles_change":
                return <AdminAuditRolesChangeCard key={record.id} record={record} />;
            case "admin_permissions_change":
                return <AdminAuditPermissionsChangeCard key={record.id} record={record} />;
            case "admin_user_add":
                return <AdminAuditUserAddCard key={record.id} record={record} />;
            case "admin_user_remove":
                return <AdminAuditUserRemoveCard key={record.id} record={record} />;
            default:
                return null;
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
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Тип события</div>
                            <Selector
                                value={filters.action_type ?? ""}
                                options={actionOptions}
                                onChange={(value) => updateFilters({ action_type: value as AdminAuditActionType })}
                            />
                        </div>
                        <InputDate
                            label="С"
                            value={filters.date_from ?? ""}
                            onChange={(event) => updateFilters({ date_from: event.target.value })}
                        />
                        <InputDate
                            label="По"
                            value={filters.date_to ?? ""}
                            onChange={(event) => updateFilters({ date_to: event.target.value })}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row items-center md:justify-between mt-4">
                    <div className="flex gap-2 items-center">
                        <Button
                            secondary
                            className="px-4 py-2 text-sm"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={handlePrevPage}
                        >
                            Назад
                        </Button>
                        <div className="text-sm text-slate-500">
                            Страница <span className="font-semibold text-slate-700">{pagination.page}</span> из{' '}
                            <span className="font-semibold text-slate-700">{pagination.last_page}</span>
                        </div>
                        <Button
                            primary
                            className="px-4 py-2 text-sm"
                            disabled={pagination.page >= pagination.last_page || isLoading}
                            onClick={handleNextPage}
                        >
                            Вперёд
                        </Button>
                    </div>
                    <Button
                        dangerInverted
                        className="px-4 py-2 text-sm"
                        onClick={() => updateFilters({ action_type: '', date_from: '', date_to: '' })}
                    >
                        Сбросить фильтры
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
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
                <div className="w-full rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
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
};