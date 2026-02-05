import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

import { Button, InputSmall, Modal, Spinner } from "../../atoms";
import { TestListElementCard } from "../../molecules/cards";
import { TestsListFiltersPanel } from "../../molecules/filters/tests/TestsListFiltersPanel";
import { authStore } from "../../../stores/authStore";
import { useTestCreate } from "../../../hooks/tests/manage";
import { useToasts } from "../../../hooks/useToasts";
import { useTestsList, useTestsListManage } from "../../../hooks/tests/list";

import type { TestListItem, TestListSort } from "../../../types/tests/TestList";

export const TestsListPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testName, setTestName] = useState("");

    const { createTest, error: createError } = useTestCreate();
    const { sort, setSort, page, perPage, setPage, resetFilters } =
        useTestsListManage();
    const {
        tests: dbTests,
        isLoading: isLoadingTests,
        error: testsError,
        pagination,
    } = useTestsList({ sort, page, perPage });
    const { addToast } = useToasts();
    const navigate = useNavigate();

    const listItems = useMemo<TestListItem[]>(() => {
        const dbItems = dbTests.map((test) => ({
            id: test.id,
            title: test.title,
            questionCount: test.total_questions ?? 0,
            disabledCount: test.total_disabled ?? 0,
            link: `/tests/${test.id}/start`,
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
        <>
            <div className="ml-auto flex w-full max-w-[110rem] flex-col gap-4 lg:flex-row">
                <div className="order-2 flex-1 space-y-4 lg:order-1">
                    {authStore.hasPermission("create tests") && (
                        <div className="flex rounded-lg border border-slate-200 p-3 bg-slate-50">
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
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
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
                    {!isLoadingTests &&
                        !testsError &&
                        listItems.length === 0 && (
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                Тесты не найдены.
                            </div>
                        )}
                    {!authStore.isAuthorized && (
                        <div className="flex gap-2 items-center rounded-lg bg-rose-100/50 p-2 mb-2">
                            <Icon
                                icon="mdi:alert-circle-outline"
                                className="w-7 h-7 inline-block mr-2 text-rose-700"
                            />
                            <div>
                                Вы не авторизованы! Некоторые тесты могут быть
                                недоступны
                            </div>
                        </div>
                    )}
                    {!isLoadingTests &&
                        listItems.map((test) => (
                            <TestListElementCard
                                key={`${test.id}`}
                                test={test}
                            />
                        ))}
                </div>
                <div className="order-1 w-full shrink-0 lg:order-2 lg:max-w-sm">
                    <TestsListFiltersPanel
                        sortValue={sort}
                        sortOptions={sortOptions}
                        onSortChange={(value) => setSort(value as TestListSort)}
                        page={page}
                        lastPage={pagination.last_page}
                        isLoading={isLoadingTests}
                        onPrevPage={() => setPage(page - 1)}
                        onNextPage={() => setPage(page + 1)}
                        onReset={resetFilters}
                    />
                </div>
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
                                const result = await createTest({
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
                                            createError ||
                                            "Не удалось создать тест",
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
        </>
    );
};
