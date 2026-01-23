import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";

import { Button } from "../../atoms";
import { QuestionEditEntity } from "../../organisms/test";

import type { QuestionDraft, QuestionDraftType } from "../../organisms/test/QuestionEditEntity";

const createDraft = (id: number, type: QuestionDraftType = 'single'): QuestionDraft => ({
    id,
    type,
    question: '',
    media: [],
    options: [''],
    correctOptions: [],
    terms: [''],
    meanings: [''],
    matches: [''],
    answers: [''],
});

export const TestCreatingPage = () => {
    const [questions, setQuestions] = useState<QuestionDraft[]>([createDraft(1)]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const current = questions[currentIndex];

    const handleAddQuestion = () => {
        const nextId = questions.length + 1;
        const nextQuestions = [...questions, createDraft(nextId)];
        setQuestions(nextQuestions);
        setCurrentIndex(nextQuestions.length - 1);
    };

    const handleUpdateCurrent = (next: QuestionDraft) => {
        setQuestions((prev) => prev.map((item, idx) => (idx === currentIndex ? next : item)));
    };

    const navItems = useMemo(() => questions.map((_, idx) => idx + 1), [questions]);

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
                    </div>
                </aside>

                <div className="flex-1 space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Создание теста</h1>
                                <p className="mt-1 text-sm text-slate-500">Добавьте вопросы, укажите типы и заполните ответы.</p>
                            </div>
                            <Button primary disabled className="px-5 py-2 text-sm">
                                Создать тест
                            </Button>
                        </div>
                    </div>

                    {current ? (
                        <QuestionEditEntity
                            index={currentIndex}
                            draft={current}
                            onChange={handleUpdateCurrent}
                        />
                    ) : (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                            Добавьте вопрос, чтобы начать редактирование.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
