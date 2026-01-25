import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";

import { Button, InputSmall, Modal, Spinner } from "../../atoms";
import { TestAutoCreateModal } from "../../molecules/modals";
import { QuestionEditEntity } from "../../organisms/test";
import { useTestManage } from "../../../hooks/editing/useTestManage";
import { useToasts } from "../../../hooks/useToasts";
import { createQuestionDraft, mapApiQuestionToDraft, mapDraftToPayload } from "../../../utils/testEditing";
import { QuestionFilesService } from "../../../services/questionFiles";

import type { QuestionDraft } from "../../organisms/test/QuestionEditEntity";

export const TestEditingPage = () => {
    const [questions, setQuestions] = useState<QuestionDraft[]>([createQuestionDraft()]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testTitle, setTestTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);
    const [isAutoFillOpen, setIsAutoFillOpen] = useState(false);
    const [autoFillType, setAutoFillType] = useState<'json' | 'ai'>('json');

    const current = questions[currentIndex];

    const { testId } = useParams();
    const { getTestById, updateTest, isFetching, isSaving, error } = useTestManage();
    const { toast } = useToasts();
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!testId) {
                navigate('/errors/404', { replace: true });
                return;
            }

            const test = await getTestById(testId);
            if (!mounted) return;

            if (!test) {
                navigate('/errors/404', { replace: true });
                return;
            }

            setTestTitle(test.title);
            const mapped = test.questions.map(mapApiQuestionToDraft);
            const prepared = mapped.length ? mapped : [createQuestionDraft()];
            setQuestions(prepared);
            setCurrentIndex(0);
        };

        load();

        return () => {
            mounted = false;
        };
    }, [testId, getTestById, navigate]);

    const handleAddQuestion = () => {
        const nextQuestions = [...questions, createQuestionDraft()];
        setQuestions(nextQuestions);
        setCurrentIndex(nextQuestions.length - 1);
    };

    const handleUpdateCurrent = (next: QuestionDraft) => {
        setQuestions((prev) => prev.map((item, idx) => (idx === currentIndex ? next : item)));
    };

    const navItems = useMemo(() => questions.map((_, idx) => idx + 1), [questions]);

    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [] as { index: number; text: string }[];
        return questions
            .map((question, index) => ({
                index,
                text: question.question,
            }))
            .filter((item) => item.text.toLowerCase().includes(query));
    }, [questions, searchQuery]);

    const handleSave = async () => {
        if (!testId) return;

        const payload = {
            title: testTitle,
            questions: questions.map(mapDraftToPayload),
        };

        const updated = await updateTest(testId, payload);
        if (!updated) {
            toast.danger(error || 'Не удалось сохранить тест');
            return;
        }

        try {
            await Promise.all(
                updated.questions.map(async (question, index) => {
                    const draft = questions[index];
                    if (!draft) return;

                    const deleteIds = draft.removedFileIds ?? [];
                    const newFiles = draft.media ?? [];

                    await Promise.all([
                        ...deleteIds.map((fileId) => QuestionFilesService.delete(question.id, fileId)),
                        ...(newFiles.length ? [QuestionFilesService.upload(question.id, newFiles)] : []),
                    ]);
                })
            );
        } catch (e: any) {
            toast.danger(e?.response?.data?.message || 'Не удалось сохранить файлы');
            return;
        }

        const refreshed = await getTestById(testId);
        if (refreshed) {
            const mapped = refreshed.questions.map(mapApiQuestionToDraft);
            setQuestions(mapped.length ? mapped : [createQuestionDraft()]);
            setCurrentIndex(0);
            setTestTitle(refreshed.title);
        }

        toast.success('Изменения сохранены');
    };

    const handleRequestDelete = (index: number) => {
        setDeleteTargetIndex(index);
    };

    const handleConfirmDelete = () => {
        if (deleteTargetIndex === null) return;

        setQuestions((prev) => {
            const next = prev.filter((_, idx) => idx !== deleteTargetIndex);
            if (next.length === 0) {
                return [createQuestionDraft()];
            }
            return next;
        });

        setCurrentIndex((prev) => {
            if (deleteTargetIndex === null) return prev;
            if (prev > deleteTargetIndex) return prev - 1;
            if (prev === deleteTargetIndex) return Math.max(0, prev - 1);
            return prev;
        });

        setDeleteTargetIndex(null);
    };

    return (
        <div className="w-full">
            <div className="flex w-full flex-col gap-6 lg:flex-row">
                <aside className="w-full lg:w-72">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-800">Вопросы</div>
                            <div className="text-xs text-slate-500">{currentIndex + 1}/{questions.length}</div>
                        </div>
                        <div className="mt-4 max-h-64 overflow-auto pr-1 lg:max-h-[calc(100vh-220px)]">
                            <div className="grid grid-cols-6 gap-2">
                                {navItems.map((item, idx) => {
                                    const isCurrent = idx === currentIndex;
                                    const base = 'h-9 w-full rounded-lg text-sm font-semibold transition-all border flex items-center justify-center select-none';
                                    const cls = isCurrent
                                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50';

                                    return (
                                        <button
                                            key={`nav-${item}`}
                                            type="button"
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`${base} ${cls}`}
                                            aria-label={`Перейти к вопросу ${item}`}
                                        >
                                            {item}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="flex h-9 w-full items-center justify-center rounded-lg border-2 border-dashed border-indigo-300 text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
                                    aria-label="Добавить вопрос"
                                >
                                    <Icon icon="mdi:plus" className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-3">
                            <Button
                                danger
                                className="w-full px-4 py-2 text-sm"
                                onClick={() => handleRequestDelete(currentIndex)}
                                disabled={isFetching || isSaving}
                            >
                                Удалить текущий вопрос
                            </Button>
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Поиск по вопросам</div>
                                <InputSmall
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Введите фразу..."
                                    leftIcon="mdi:magnify"
                                    className="py-2"
                                />
                                {searchQuery.trim().length > 0 && (
                                    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-600">
                                        {searchResults.length ? (
                                            <div className="space-y-1">
                                                {searchResults.map((item) => (
                                                    <button
                                                        key={`search-${item.index}`}
                                                        type="button"
                                                        onClick={() => setCurrentIndex(item.index)}
                                                        className="w-full rounded-md px-2 py-1 text-left transition hover:bg-slate-100"
                                                    >
                                                        <span className="font-semibold text-slate-800">Вопрос {item.index + 1}:</span>{' '}
                                                        <span className="text-slate-500">
                                                            {item.text.length > 60 ? `${item.text.slice(0, 60)}...` : item.text || 'Без текста'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="px-2 py-1 text-slate-400">Совпадений не найдено.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 p-5 bg-white rounded-2xl space-y-3 border border-slate-200 shadow-sm">
                        <Button
                            primary
                            className="w-full px-4 py-2 text-sm"
                            onClick={() => {
                                setAutoFillType('json');
                                setIsAutoFillOpen(true);
                            }}
                            disabled={isFetching || isSaving}
                        >
                            Импортировать вопросы
                        </Button>
                        <Button
                            secondary
                            className="w-full px-4 py-2 text-sm"
                            onClick={() => {}}
                            disabled={isFetching || isSaving}
                        >
                            Экспортировать вопросы
                        </Button>
                        <div className="border-b border-slate-200" />
                        <Button
                            successInverted
                            className="w-full px-4 py-2 text-sm"
                            onClick={() => {
                                setAutoFillType('ai');
                                setIsAutoFillOpen(true);
                            }}
                            disabled={isFetching || isSaving}
                        >
                            Заполнить с помощью ИИ
                        </Button>
                    </div>
                </aside>

                <div className="flex-1 space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Редактирование теста</h1>
                                <p className="mt-1 text-sm text-slate-500">{testTitle || 'Загрузка...'}</p>
                            </div>
                            <Button
                                primary
                                disabled={isFetching || isSaving}
                                className="px-5 py-2 text-sm"
                                onClick={handleSave}
                            >
                                {isSaving ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Spinner className="h-4 w-4" />
                                        Сохраняем...
                                    </span>
                                ) : (
                                    'Сохранить изменения'
                                )}
                            </Button>
                        </div>
                    </div>

                    {error && !isFetching && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                            {error}
                        </div>
                    )}

                    {isFetching && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                            <div className="flex items-center justify-center gap-2">
                                <Spinner className="h-4 w-4" />
                                Загружаем тест...
                            </div>
                        </div>
                    )}

                    {!isFetching && current ? (
                        <QuestionEditEntity
                            index={currentIndex}
                            draft={current}
                            onChange={handleUpdateCurrent}
                        />
                    ) : !isFetching ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                            Добавьте вопрос, чтобы начать редактирование.
                        </div>
                    ) : null}
                </div>
            </div>
            <Modal
                open={deleteTargetIndex !== null}
                onClose={() => setDeleteTargetIndex(null)}
                title={<h3 className="text-lg font-semibold text-slate-800">Подтвердите удаление</h3>}
                outsideClickClosing
            >
                <div className="space-y-4 mb-2">
                    <p className="text-sm text-slate-600">
                        Удалить вопрос{' '}
                        <span className="font-semibold text-slate-800">№{(deleteTargetIndex ?? 0) + 1}</span>?
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button secondary className="flex-1 p-2" onClick={() => setDeleteTargetIndex(null)}>
                            Отмена
                        </Button>
                        <Button danger className="p-2" onClick={handleConfirmDelete}>
                            Удалить
                        </Button>
                    </div>
                </div>
            </Modal>
            {testId ? (
                <TestAutoCreateModal
                    open={isAutoFillOpen}
                    onClose={() => setIsAutoFillOpen(false)}
                    testId={testId}
                    fillBy={autoFillType}
                    onCompleted={async () => {
                        const refreshed = await getTestById(testId);
                        if (refreshed) {
                            const mapped = refreshed.questions.map(mapApiQuestionToDraft);
                            setQuestions(mapped.length ? mapped : [createQuestionDraft()]);
                            setCurrentIndex(0);
                            setTestTitle(refreshed.title);
                        }
                    }}
                />
            ) : null}
        </div>
    );
};
