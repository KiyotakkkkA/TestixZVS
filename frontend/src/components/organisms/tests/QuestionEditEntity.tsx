import { useMemo } from "react";
import { Icon } from "@iconify/react";

import { Button, InputBig, InputMedia, Selector } from "../../atoms";
import {
    FullAnswerForm,
    MatchingForm,
    MultipleChoiceForm,
    SingleChoiceForm,
} from "../../molecules/forms/tests/editing";

import type { TestQuestionPayload } from "../../../types/tests/TestManagement";

export type QuestionDraftType =
    | "single"
    | "multiple"
    | "matching"
    | "full_answer";

export type QuestionDraft = {
    id?: number;
    clientId: string;
    type: QuestionDraftType;
    disabled?: boolean;
    question: string;
    media: File[];
    existingFiles: {
        id: number;
        name: string;
        url: string;
        mime_type?: string | null;
        size?: number | null;
    }[];
    removedFileIds: number[];
    options: string[];
    correctOptions: number[];
    terms: string[];
    meanings: string[];
    matches: string[];
    answers: string[];
    lastSavedPayload?: TestQuestionPayload | null;
};

export type QuestionEditEntityProps = {
    index: number;
    draft: QuestionDraft;
    onChange: (next: QuestionDraft) => void;
};

export const QuestionEditEntity = ({
    index,
    draft,
    onChange,
}: QuestionEditEntityProps) => {
    const typeOptions = useMemo(
        () => [
            { value: "single", label: "Один вариант" },
            { value: "multiple", label: "Несколько вариантов" },
            { value: "matching", label: "Соответствия" },
            { value: "full_answer", label: "Развёрнутый ответ" },
        ],
        [],
    );

    const update = (patch: Partial<QuestionDraft>) => {
        onChange({ ...draft, ...patch });
    };

    const updateOption = (index: number, value: string) => {
        const next = [...draft.options];
        next[index] = value;
        update({ options: next });
    };

    const toggleCorrect = (index: number, single: boolean) => {
        if (single) {
            update({ correctOptions: [index] });
            return;
        }
        const next = draft.correctOptions.includes(index)
            ? draft.correctOptions.filter((i) => i !== index)
            : [...draft.correctOptions, index];
        update({ correctOptions: next });
    };

    const addOption = () => update({ options: [...draft.options, ""] });
    const removeOption = (index: number) => {
        const nextOptions = draft.options.filter((_, i) => i !== index);
        const nextCorrect = draft.correctOptions
            .filter((i) => i !== index)
            .map((i) => (i > index ? i - 1 : i));
        update({ options: nextOptions, correctOptions: nextCorrect });
    };

    const updateTerm = (index: number, value: string) => {
        const next = [...draft.terms];
        next[index] = value;
        update({ terms: next });
    };

    const updateMeaning = (index: number, value: string) => {
        const next = [...draft.meanings];
        next[index] = value;
        update({ meanings: next });
    };

    const updateMatch = (meaningIndex: number, termKey: string) => {
        const next = [...draft.matches];
        next[meaningIndex] = termKey;
        update({ matches: next });
    };

    const addTerm = () => update({ terms: [...draft.terms, ""] });
    const addMeaning = () =>
        update({
            meanings: [...draft.meanings, ""],
            matches: [...draft.matches, ""],
        });
    const removeTerm = (index: number) => {
        const nextTerms = draft.terms.filter((_, i) => i !== index);
        update({ terms: nextTerms });
    };
    const removeMeaning = (index: number) => {
        const nextMeanings = draft.meanings.filter((_, i) => i !== index);
        const nextMatches = draft.matches.filter((_, i) => i !== index);
        update({ meanings: nextMeanings, matches: nextMatches });
    };

    const updateAnswer = (index: number, value: string) => {
        const next = [...draft.answers];
        next[index] = value;
        update({ answers: next });
    };

    const addAnswer = () => update({ answers: [...draft.answers, ""] });
    const removeAnswer = (index: number) => {
        const nextAnswers = draft.answers.filter((_, i) => i !== index);
        update({ answers: nextAnswers });
    };

    const handleRemoveExistingFile = (fileId: number) => {
        update({
            existingFiles: draft.existingFiles.filter(
                (file) => file.id !== fileId,
            ),
            removedFileIds: [...draft.removedFileIds, fileId],
        });
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Вопрос {index + 1}
                    </div>
                    <div className="text-lg font-semibold text-slate-800">
                        Настройка вопроса
                    </div>
                </div>
                <div className="w-full sm:w-64 flex items-center gap-3">
                    <Selector
                        value={draft.type}
                        options={typeOptions}
                        className="flex-1"
                        onChange={(value) =>
                            update({ type: value as QuestionDraftType })
                        }
                    />
                </div>
            </div>

            <div className="mt-5 space-y-1">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Видимость вопроса
                </div>
                <div
                    className={`${draft.disabled ? "bg-red-100" : "bg-green-100"} p-3 rounded-lg text-slate-600 text-sm flex justify-between items-center transition-colors`}
                >
                    {draft.disabled ? (
                        <>
                            <span>
                                Этот вопрос не будет будет показан никому во
                                время прохождения теста.
                            </span>
                            <Button
                                className="p-2 bg-red-500"
                                onClick={() => update({ disabled: false })}
                            >
                                <Icon
                                    icon="mdi:eye-off"
                                    className="h-5 w-5 text-white"
                                />
                            </Button>
                        </>
                    ) : (
                        <>
                            <span>
                                Этот вопрос будет показан всем во время
                                прохождения теста.
                            </span>
                            <Button
                                className="p-2 bg-green-500"
                                onClick={() => update({ disabled: true })}
                            >
                                <Icon
                                    icon="mdi:eye"
                                    className="h-5 w-5 text-white"
                                />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="mt-5 space-y-5">
                <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Текст вопроса
                    </div>
                    <InputBig
                        value={draft.question}
                        onChange={(event) =>
                            update({ question: event.target.value })
                        }
                        placeholder="Введите вопрос..."
                        className="min-h-[120px] px-4 py-3"
                    />
                </div>

                <InputMedia
                    label="Медиа"
                    helperText="Изображения или видео для вопроса"
                    accept="image/png,image/jpeg"
                    value={draft.media}
                    existingFiles={draft.existingFiles}
                    onRemoveExisting={(file) =>
                        handleRemoveExistingFile(file.id)
                    }
                    onChange={(files) => update({ media: files })}
                />

                {draft.type === "single" && (
                    <SingleChoiceForm
                        options={draft.options}
                        correctAnswers={draft.correctOptions}
                        onOptionChange={updateOption}
                        onToggleCorrect={(index) => toggleCorrect(index, true)}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                    />
                )}

                {draft.type === "multiple" && (
                    <MultipleChoiceForm
                        options={draft.options}
                        correctAnswers={draft.correctOptions}
                        onOptionChange={updateOption}
                        onToggleCorrect={(index) => toggleCorrect(index, false)}
                        onAddOption={addOption}
                        onRemoveOption={removeOption}
                    />
                )}

                {draft.type === "matching" && (
                    <MatchingForm
                        terms={draft.terms}
                        meanings={draft.meanings}
                        matches={draft.matches}
                        onTermChange={updateTerm}
                        onMeaningChange={updateMeaning}
                        onMatchChange={updateMatch}
                        onAddTerm={addTerm}
                        onAddMeaning={addMeaning}
                        onRemoveTerm={removeTerm}
                        onRemoveMeaning={removeMeaning}
                    />
                )}

                {draft.type === "full_answer" && (
                    <FullAnswerForm
                        answers={draft.answers}
                        onAnswerChange={updateAnswer}
                        onAddAnswer={addAnswer}
                        onRemoveAnswer={removeAnswer}
                    />
                )}
            </div>
        </div>
    );
};
