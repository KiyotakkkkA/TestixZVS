import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { Spinner } from "../../atoms";
import { AdminTestAccessCard } from "../../molecules/cards/admin";
import { AdminTestsAccessFiltersPanel } from "../../molecules/filters/admin/AdminTestsAccessFiltersPanel";
import {
    useAdminTestsAccess,
    useAdminTestsAccessManage,
    useAdminTestsAccessUpdateStatus,
    useAdminTestsAccessUpdateUsers,
    useAdminTestsAccessUsers,
} from "../../../hooks/admin/access";
import { useToasts } from "../../../hooks/useToasts";

import type { ArrayAutoFillOption } from "../../atoms/ArrayAutoFillSelector";
import type { AdminTestsAccessStatus } from "../../../types/admin/AdminTestsAccess";

export const AdminTestsAccessPage = observer(() => {
    const { toast } = useToasts();
    const { filters, appliedFilters, updateFilters } =
        useAdminTestsAccessManage();
    const { tests, pagination, isLoading, error } =
        useAdminTestsAccess(appliedFilters);
    const [userSearch, setUserSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const {
        users,
        isLoading: usersLoading,
        error: usersError,
    } = useAdminTestsAccessUsers(debouncedSearch || undefined);
    const { updateTestAccessStatus, isUpdating: statusUpdating } =
        useAdminTestsAccessUpdateStatus();
    const { updateTestAccessUsers, isUpdating: usersUpdating } =
        useAdminTestsAccessUpdateUsers();
    const isUpdating = useMemo(
        () => ({ ...statusUpdating, ...usersUpdating }),
        [statusUpdating, usersUpdating],
    );

    const sortOptions = useMemo(
        () => [
            { value: "title_asc", label: "По названию (А→Я)" },
            { value: "title_desc", label: "По названию (Я→А)" },
        ],
        [],
    );

    const sortValue = useMemo(() => {
        if (filters.sort_dir === "desc") return "title_desc";
        return "title_asc";
    }, [filters.sort_dir]);

    const userOptions = useMemo<ArrayAutoFillOption[]>(
        () =>
            users.map((user) => ({
                value: String(user.id),
                label: user.name,
                description: user.email,
            })),
        [users],
    );

    useEffect(() => {
        const handle = window.setTimeout(() => {
            setDebouncedSearch(userSearch.trim());
        }, 300);
        return () => window.clearTimeout(handle);
    }, [userSearch]);

    const handleStatusChange = async (
        testId: string,
        status: AdminTestsAccessStatus,
    ) => {
        try {
            await updateTestAccessStatus(testId, status);
            toast.success("Доступ обновлён");
        } catch (e: any) {
            toast.danger(
                e?.response?.data?.message || "Не удалось обновить доступ",
            );
        }
    };

    const resetFilters = () => {
        updateFilters({
            page: 1,
            sort_by: "title",
            sort_dir: "asc",
        });
        setUserSearch("");
        setDebouncedSearch("");
    };

    const handleUsersSave = async (testId: string, userIds: number[]) => {
        try {
            await updateTestAccessUsers(testId, userIds);
            toast.success("Доступ пользователям сохранён");
        } catch (e: any) {
            toast.danger(
                e?.response?.data?.message || "Не удалось обновить доступ",
            );
        }
    };

    return (
        <div className="flex flex-col gap-4 lg:flex-row animate-fade-in">
            <div className="order-2 flex-1 space-y-4 lg:order-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="text-2xl font-semibold text-slate-800">
                                Доступ к тестам
                            </div>
                            <div className="text-sm text-slate-500">
                                Настраивайте видимость тестов и выдавайте доступ
                                выбранным пользователям.
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                            <Spinner className="h-4 w-4" />
                            Загружаем тесты...
                        </div>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {!isLoading && !error && tests.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                        Тестов не найдено.
                    </div>
                )}

                {!isLoading && !error && tests.length > 0 && (
                    <div className="space-y-4">
                        {tests.map((test) => (
                            <AdminTestAccessCard
                                key={test.id}
                                test={test}
                                userOptions={userOptions}
                                isUpdating={Boolean(isUpdating[test.id])}
                                onStatusChange={handleStatusChange}
                                onUsersSave={handleUsersSave}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="order-1 w-full shrink-0 lg:order-2 lg:max-w-sm">
                <AdminTestsAccessFiltersPanel
                    sortValue={sortValue}
                    sortOptions={sortOptions}
                    onSortChange={(value) =>
                        updateFilters({
                            sort_by: "title",
                            sort_dir: value === "title_desc" ? "desc" : "asc",
                        })
                    }
                    userSearch={userSearch}
                    onUserSearchChange={setUserSearch}
                    usersLoading={usersLoading}
                    usersError={usersError}
                    pagination={pagination}
                    isLoading={isLoading}
                    onPrevPage={() =>
                        updateFilters({ page: pagination.page - 1 })
                    }
                    onNextPage={() =>
                        updateFilters({ page: pagination.page + 1 })
                    }
                    onReset={resetFilters}
                />
            </div>
        </div>
    );
});
