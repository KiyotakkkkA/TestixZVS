import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

import { Button, InputSmall, Modal, Selector, Spinner } from "../../atoms";
import { TestListElementCard } from "../../molecules/cards";
import { authStore } from "../../../stores/authStore";
import { useTestManage } from "../../../hooks/tests/useTestManage";
import { useToasts } from "../../../hooks/useToasts";
import { useTestsList } from "../../../hooks/tests/useTestsList";

import type { TestListItem, TestListSort } from "../../../types/tests/TestList";

export const TestsListPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testName, setTestName] = useState("");

    const { error, createBlankTest } = useTestManage();
    const {
        tests: dbTests,
        isLoading: isLoadingTests,
        error: testsError,
        sort,
        setSort,
        page,
        lastPage,
        setPage,
        resetFilters,
    } = useTestsList();
    const { addToast } = useToasts();
    const navigate = useNavigate();

    const listItems = useMemo<TestListItem[]>(() => {
        const dbItems = dbTests.map((test) => ({
            id: test.id,
            title: test.title,
            questionCount: test.total_questions ?? 0,
            disabledCount: test.total_disabled ?? 0,
            link: `/tests/${test.id}/start`,
            source: "db" as const,
        }));

        return [...dbItems];
    }, [dbTests]);

    const sortOptions = useMemo(
        () => [
            { value: "title_asc", label: "По названию (А→Я)" },
            { value: "title_desc", label: "По названию (Я→А)" },
        ],
        [],
    );

    return (
        <div className="w-full">
            <div className="mx-auto flex w-full max-w-3xl flex-col space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="w-full sm:max-w-xs">
                            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Сортировка
                            </div>
                            <Selector
                                value={sort}
                                options={sortOptions}
                                onChange={(value) =>
                                    setSort(value as TestListSort)
                                }
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <Button
                                secondary
                                className="w-full px-4 py-2 text-sm sm:w-auto"
                                disabled={page <= 1 || isLoadingTests}
                                onClick={() => setPage(page - 1)}
                            >
                                Назад
                            </Button>
                            <div className="text-center text-sm text-slate-500 sm:text-left">
                                Страница{" "}
                                <span className="font-semibold text-slate-700">
                                    {page}
                                </span>{" "}
                                из{" "}
                                <span className="font-semibold text-slate-700">
                                    {lastPage}
                                </span>
                            </div>
                            <Button
                                primary
                                className="w-full px-4 py-2 text-sm sm:w-auto"
                                disabled={page >= lastPage || isLoadingTests}
                                onClick={() => setPage(page + 1)}
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
                {authStore.hasPermission("create tests") && (
                    <div className="flex rounded-lg border border-slate-200 p-3 bg-white">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 border-dashed border-2 border-indigo-600 p-5 items-center justify-center flex flex-col text-indigo-600 hover:bg-indigo-50"
                        >
                            <Icon
                                icon="mdi:add-circle-outline"
                                className="w-10 h-10 text-indigo-600"
                            />
                        </Button>
                    </div>
                )}
                {isLoadingTests && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                            <Spinner className="h-4 w-4" />
                            Загружаем тесты...
                        </div>
                    </div>
                )}
                {!isLoadingTests && testsError && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                        {testsError}
                    </div>
                )}
                {!isLoadingTests && !testsError && listItems.length === 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                        Тесты не найдены.
                    </div>
                )}
                {!isLoadingTests &&
                    listItems.map((test) => (
                        <TestListElementCard
                            key={`${test.source}-${test.id}`}
                            test={test}
                        />
                    ))}
            </div>
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Создать новый тест
                    </h2>
                }
            >
                <div className="p-2 space-y-4">
                    <InputSmall
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        className="p-2"
                        placeholder="Введите название теста"
                    />
                    <div className="flex gap-2">
                        <Button
                            secondary
                            onClick={() => setIsModalOpen(false)}
                            className="p-2"
                        >
                            Отмена
                        </Button>
                        <Button
                            primary
                            onClick={async () => {
                                const result = await createBlankTest({
                                    title: testName,
                                });
                                if (result?.testId) {
                                    addToast({
                                        type: "success",
                                        message: "Тест был успешно создан",
                                    });
                                    setIsModalOpen(false);
                                    setTestName("");
                                    navigate(
                                        "/workbench/test/" + result.testId,
                                    );
                                } else {
                                    addToast({
                                        type: "danger",
                                        message:
                                            error || "Не удалось создать тест",
                                    });
                                }
                            }}
                            className="flex-1 p-2"
                        >
                            Создать тест
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
