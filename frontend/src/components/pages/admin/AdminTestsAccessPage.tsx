import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import { Button, InputSmall, Selector, Spinner } from "../../atoms";
import { AdminTestAccessCard } from "../../molecules/cards/admin";
import { useAdminTestsAccess } from "../../../hooks/admin/useAdminTestsAccess";
import { useToasts } from "../../../hooks/useToasts";

import type { ArrayAutoFillOption } from "../../atoms/ArrayAutoFillSelector";
import type { AdminTestsAccessStatus } from "../../../types/admin/AdminTestsAccess";

export const AdminTestsAccessPage = observer(() => {
    const { toast } = useToasts();
    const {
        tests,
        pagination,
        filters,
        users,
        isLoading,
        isUpdating,
        usersLoading,
        error,
        usersError,
        updateFilters,
        loadUsers,
        updateTestAccessStatus,
        updateTestAccessUsers,
    } = useAdminTestsAccess();

    const [userSearch, setUserSearch] = useState("");

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
            loadUsers(userSearch.trim() || undefined);
        }, 300);
        return () => window.clearTimeout(handle);
    }, [loadUsers, userSearch]);

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
        <div className="w-full space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid w-full gap-4 sm:grid-cols-2">
                        <div>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Сортировка
                            </div>
                            <Selector
                                value={sortValue}
                                options={sortOptions}
                                onChange={(value) =>
                                    updateFilters({
                                        sort_by: "title",
                                        sort_dir:
                                            value === "title_desc"
                                                ? "desc"
                                                : "asc",
                                    })
                                }
                            />
                        </div>
                        <div>
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Поиск пользователей
                            </div>
                            <InputSmall
                                value={userSearch}
                                onChange={(event) =>
                                    setUserSearch(event.target.value)
                                }
                                placeholder="Имя или email"
                                className="p-2"
                            />
                            {usersLoading && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                    <Spinner className="h-3 w-3" />
                                    Загружаем пользователей...
                                </div>
                            )}
                            {usersError && (
                                <div className="mt-2 text-xs text-rose-600">
                                    {usersError}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Button
                            secondary
                            className="w-full px-4 py-2 text-sm sm:w-auto"
                            disabled={pagination.page <= 1 || isLoading}
                            onClick={() =>
                                updateFilters({ page: pagination.page - 1 })
                            }
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
                            onClick={() =>
                                updateFilters({ page: pagination.page + 1 })
                            }
                        >
                            Вперёд
                        </Button>
                    </div>
                    <Button
                        dangerInverted
                        className="w-full px-4 py-2 text-sm sm:w-auto"
                        onClick={resetFilters}
                    >
                        Сбросить фильтры
                    </Button>
                </div>
            </div>

            {isLoading && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
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
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
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
    );
});
