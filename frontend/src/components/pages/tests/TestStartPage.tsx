import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";

import {
    Button,
    InputSlider,
    Modal,
    SlidedPanel,
    SwitchRow,
} from "../../atoms";
import { ExpressTestModal } from "../../molecules/modals/tests";
import { useTestPassing } from "../../../hooks/tests/passing";
import { useTestDelete } from "../../../hooks/tests/manage";
import { TestService } from "../../../services/test";
import { Spinner } from "../../atoms";
import { authStore } from "../../../stores/authStore";

import type { Test } from "../../../types/tests/Test";

export const TestStartPage = () => {
    const [isOpenSlided, setIsOpenSlided] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [dbTest, setDbTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [accessError, setAccessError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const { isSaving, deleteTest } = useTestDelete();

    const testId = useParams<{ testId: string }>().testId;
    const accessLink = new URLSearchParams(location.search).get("access_link");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!testId) return;
            try {
                setIsLoading(true);
                setAccessError(null);
                const response = await TestService.getPublicTestById(
                    testId,
                    accessLink,
                );
                if (!mounted) return;
                setDbTest({
                    uuid: response.test.id,
                    discipline_name: response.test.title,
                    questions: response.test.questions,
                    total_questions: response.test.total_questions,
                    total_disabled: response.test.total_disabled,
                    is_current_user_creator:
                        response.test.is_current_user_creator ?? false,
                });
            } catch (e) {
                if (!mounted) return;
                setAccessError("Не удалось загрузить тест");
                setDbTest(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [testId, accessLink]);

    const test = dbTest;

    const fullAnswerModes = [
        {
            value: "lite",
            title: "Lite",
            description: "Достаточно передать суть ответа",
        },
        {
            value: "medium",
            title: "Medium",
            description: "Нужны ключевые термины и конструкции",
        },
        {
            value: "hard",
            title: "Hard",
            description: "Почти полное воспроизведение ответа",
        },
        {
            value: "unreal",
            title: "Unreal",
            description: "Практически дословное совпадение",
        },
    ] as const;

    const { settings, updateSettings, startTest, session } = useTestPassing(
        testId || "",
        test?.questions || [],
    );

    useEffect(() => {
        if (!testId) return;
        if (!session) return;
        if (session.testId !== testId) return;
        if (session.mode && session.mode !== "normal") return;
        const linkQuery = accessLink ? `?access_link=${accessLink}` : "";
        navigate(`/tests/${testId}${linkQuery}`, { replace: true });
    }, [navigate, session, testId, accessLink]);

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl m-auto">
                <div className="bg-slate-50 rounded-lg shadow-xl p-8 md:p-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Spinner className="h-4 w-4" />
                        Загружаем тест...
                    </div>
                </div>
            </div>
        );
    }

    if (accessError) {
        return (
            <div className="w-full max-w-2xl m-auto">
                <div className="bg-slate-50 rounded-lg shadow-xl p-8 md:p-12 text-center space-y-4">
                    <div className="text-lg font-semibold text-slate-800">
                        {accessError}
                    </div>
                    {!authStore.isAuthorized && (
                        <Button
                            primary
                            className="px-4 py-2 text-sm"
                            onClick={() => navigate("/login")}
                        >
                            Войти
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    if (!test) {
        return <div>Тест не найден</div>;
    }

    const accessToTestManagement =
        (test.is_current_user_creator ?? false) ||
        authStore.hasPermissions(["tests master access"]);
    const canDeleteTest =
        accessToTestManagement && authStore.hasPermissions(["delete tests"]);
    const canEditTest =
        accessToTestManagement && authStore.hasPermissions(["edit tests"]);
    const canDownloadTest = authStore.hasPermissions(["make reports"]);

    const handleDownload = async () => {
        if (!testId) return;
        try {
            setIsDownloadingPdf(true);
            await TestService.downloadTestPdf(testId);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    return (
        <div className="w-full max-w-2xl space-y-8 m-auto">
            <div className="bg-slate-50 rounded-lg shadow-xl p-8 md:p-12 text-center space-y-6">
                <div className="flex justify-between">
                    <Button
                        onClick={() => {
                            navigate("/");
                        }}
                        primaryNoBackground
                        className="text-md font-medium flex items-center gap-2"
                    >
                        <Icon icon="mdi:arrow-left" className="h-7 w-7" />
                        Назад
                    </Button>
                    <div className="flex items-center">
                        {(canEditTest || canDeleteTest || canDownloadTest) && (
                            <div className="flex items-center border border-slate-200 shadow-sm p-2 gap-6 rounded-lg mr-4">
                                {canDownloadTest && (
                                    <Button
                                        onClick={handleDownload}
                                        primaryNoBackground
                                        isLoading={isDownloadingPdf}
                                        className="text-md font-medium flex items-center gap-2"
                                        disabled={isDownloadingPdf}
                                    >
                                        <Icon
                                            icon="mdi:download"
                                            className="h-7 w-7"
                                        />
                                    </Button>
                                )}
                                {canEditTest && (
                                    <Button
                                        onClick={() => {
                                            navigate(
                                                `/workbench/test/${testId}`,
                                            );
                                        }}
                                        primaryNoBackground
                                        className="text-md font-medium flex items-center gap-2"
                                    >
                                        <Icon
                                            icon="mdi:pen"
                                            className="h-7 w-7"
                                        />
                                    </Button>
                                )}
                                {canDeleteTest && (
                                    <Button
                                        onClick={() => {
                                            setIsOpenDeleteModal(true);
                                        }}
                                        dangerNoBackground
                                        className="text-md font-medium flex items-center gap-2"
                                    >
                                        <Icon
                                            icon="mdi:delete"
                                            className="h-7 w-7"
                                        />
                                    </Button>
                                )}
                            </div>
                        )}
                        <Button
                            onClick={() => setIsOpenSlided(true)}
                            primaryNoBackground
                        >
                            <Icon icon="mdi:cog" className="h-7 w-7" />
                        </Button>
                    </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        {test.discipline_name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-slate-700">
                        <span className="text-lg font-semibold">
                            {test.questions.length} вопросов
                        </span>
                    </div>
                </div>

                <div className="space-y-3 text-left bg-slate-50 rounded-lg p-6">
                    <h3 className="font-semibold text-slate-800">
                        Как это работает:
                    </h3>
                    <ul className="space-y-2 text-slate-700">
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-slate-50 text-sm flex items-center justify-center">
                                1
                            </span>
                            <span>
                                Вам будут предложены вопросы разных типов
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-slate-50 text-sm flex items-center justify-center">
                                2
                            </span>
                            <span>Вы можете перемещаться между вопросами</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-slate-50 text-sm flex items-center justify-center">
                                3
                            </span>
                            <span>
                                После завершения вы увидите результат и оценку
                            </span>
                        </li>
                    </ul>
                </div>

                <Button
                    onClick={() => {
                        startTest({ mode: "normal" });
                        const linkQuery = accessLink
                            ? `?access_link=${accessLink}`
                            : "";
                        navigate(`/tests/${test.uuid}${linkQuery}`);
                    }}
                    primary
                    className="w-full py-3.5 text-xl font-medium tracking-tight"
                >
                    Начать тестирование
                </Button>

                <Button
                    onClick={() => setIsOpenModal(true)}
                    secondary
                    className="w-full py-3.5 text-xl font-medium tracking-tight"
                >
                    Сгенерировать экспресс-тест
                </Button>
            </div>
            <SlidedPanel
                open={isOpenSlided}
                onClose={() => setIsOpenSlided(false)}
                title={
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Настройки
                    </h2>
                }
            >
                <div className="px-6 py-4 overflow-y-auto">
                    <div className="py-4">
                        <div className="flex items-baseline justify-between gap-3">
                            <div>
                                <div className="font-semibold text-slate-800">
                                    Порог прохода
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                    Минимум правильных ответов
                                </div>
                            </div>
                            <div className="text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1">
                                {settings.passThreshold} /{" "}
                                {test.questions.length}
                            </div>
                        </div>

                        <InputSlider
                            min={1}
                            max={Math.max(1, test.questions.length)}
                            step={1}
                            value={Math.min(
                                Math.max(1, settings.passThreshold),
                                Math.max(1, test.questions.length),
                            )}
                            onChange={(value) =>
                                updateSettings({ passThreshold: value })
                            }
                        />
                    </div>

                    <div className="border-t border-slate-200" />

                    <SwitchRow
                        title="Включить подсказки во время теста"
                        description="Показывает дополнительную кнопку, подсвечивающую правильные ответы"
                        checked={settings.hintsEnabled}
                        onChange={(checked) =>
                            updateSettings({ hintsEnabled: checked })
                        }
                    />

                    <div className="border-t border-slate-200" />

                    <SwitchRow
                        title="Проверять вопрос после ответа"
                        description="После нажатия 'Далее' выполняется автопроверка"
                        checked={settings.checkAfterAnswer}
                        onChange={(checked) =>
                            updateSettings({ checkAfterAnswer: checked })
                        }
                    />

                    <div className="border-t border-slate-200" />

                    <div className="py-4">
                        <div className="font-semibold text-slate-800">
                            Режим проверки для полного ответа
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                            Определяет строгость оценки AI
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                            {fullAnswerModes.map((mode) => (
                                <button
                                    key={mode.value}
                                    type="button"
                                    onClick={() =>
                                        updateSettings({
                                            fullAnswerCheckMode: mode.value,
                                        })
                                    }
                                    className={
                                        `rounded-lg border px-4 py-3 text-left transition-colors ` +
                                        (settings.fullAnswerCheckMode ===
                                        mode.value
                                            ? "border-indigo-200 bg-indigo-50"
                                            : "border-slate-200 bg-slate-50 hover:bg-slate-100")
                                    }
                                >
                                    <div className="font-semibold text-slate-900">
                                        {mode.title}
                                    </div>
                                    <div className="text-sm text-slate-600 mt-1">
                                        {mode.description}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-slate-200" />

                    <SwitchRow
                        title="Отображать неправильные ответы в конце теста"
                        description="Показывает вопросы, где были допущены ошибки и правильные ответы"
                        checked={settings.showIncorrectAtEnd}
                        onChange={(checked) =>
                            updateSettings({ showIncorrectAtEnd: checked })
                        }
                    />
                </div>
            </SlidedPanel>
            <ExpressTestModal
                test={test}
                open={isOpenModal}
                totalQuestions={test.questions.length}
                onClose={() => setIsOpenModal(false)}
            />
            <Modal
                open={isOpenDeleteModal}
                onClose={() => setIsOpenDeleteModal(false)}
                title={
                    <h3 className="text-lg font-semibold text-slate-800">
                        Подтвердите удаление
                    </h3>
                }
                outsideClickClosing
            >
                <div className="space-y-4 mb-2">
                    <p className="text-sm text-slate-600">
                        Удалить тест{" "}
                        <span className="font-semibold text-slate-800">
                            {test.discipline_name}
                        </span>
                        ?
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 p-2"
                            disabled={isSaving}
                            onClick={() => setIsOpenDeleteModal(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            danger
                            className="p-2 flex items-center gap-3"
                            isLoading={isSaving}
                            loadingText="Удаляем..."
                            disabled={isSaving}
                            onClick={async () => {
                                if (!testId) return;
                                await deleteTest(testId);
                                navigate("/");
                            }}
                        >
                            Удалить
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
