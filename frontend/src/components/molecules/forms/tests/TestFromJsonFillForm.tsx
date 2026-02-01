import { useMemo, useState } from "react";

import { Button, InputMedia, InputSmall, Modal } from "../../../atoms";
import { TestService } from "../../../../services/test";
import { useToasts } from "../../../../hooks/useToasts";

import type {
    JsonQuestionInput,
    TestAutoFillPayload,
} from "../../../../types/tests/TestManagement";

type ParsedSelection = {
    indices: number[];
    error: string | null;
};

const typeLabels: Record<JsonQuestionInput["type"], string> = {
    single: "Один ответ",
    multiple: "Несколько ответов",
    matching: "Соответствие",
    full_answer: "Полный ответ",
};

const getQuestionsFromJson = (data: any): JsonQuestionInput[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data as JsonQuestionInput[];
    if (Array.isArray(data.questions))
        return data.questions as JsonQuestionInput[];
    if (Array.isArray(data.test?.questions))
        return data.test.questions as JsonQuestionInput[];
    return [];
};

const parseSelection = (raw: string, total: number): ParsedSelection => {
    if (!total) return { indices: [], error: null };
    const value = raw.trim();
    if (!value) {
        return {
            indices: Array.from({ length: total }, (_, i) => i + 1),
            error: null,
        };
    }

    const parts = value
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
    const indices = new Set<number>();
    let error: string | null = null;

    parts.forEach((part) => {
        if (part.includes(":")) {
            const [startRaw, endRaw] = part.split(":").map((p) => p.trim());
            const start = Number(startRaw);
            const end = Number(endRaw);
            if (!Number.isFinite(start) || !Number.isFinite(end)) {
                error = "Неверный формат интервала.";
                return;
            }
            const from = Math.max(1, Math.min(start, end));
            const to = Math.min(total, Math.max(start, end));
            for (let i = from; i <= to; i += 1) {
                indices.add(i);
            }
            return;
        }

        const single = Number(part);
        if (!Number.isFinite(single) || single < 1) {
            error = "Неверный индекс вопроса.";
            return;
        }
        if (single <= total) {
            indices.add(single);
        }
    });

    const list = Array.from(indices).sort((a, b) => a - b);
    if (!list.length) {
        error = error ?? "Не удалось выбрать ни одного вопроса.";
    }

    return { indices: list, error };
};

interface TestFromJsonFillFormProps {
    testId: string;
    onSuccess: () => void;
}

export const TestFromJsonFillForm = ({
    testId,
    onSuccess,
}: TestFromJsonFillFormProps) => {
    const { toast } = useToasts();
    const [questions, setQuestions] = useState<JsonQuestionInput[]>([]);
    const [selection, setSelection] = useState("");
    const [parseError, setParseError] = useState<string | null>(null);
    const [isReading, setIsReading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(false);

    const total = questions.length;

    const parsedSelection = useMemo(
        () => parseSelection(selection, total),
        [selection, total],
    );

    const selectedQuestions = useMemo(
        () =>
            parsedSelection.indices
                .map((idx) => questions[idx - 1])
                .filter(Boolean),
        [parsedSelection.indices, questions],
    );

    const handleFileChange = (files: File[]) => {
        const file = files[0];
        if (!file) {
            setQuestions([]);
            setSelection("");
            setParseError(null);
            return;
        }

        setIsReading(true);
        setParseError(null);

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const raw = String(reader.result ?? "").trim();
                const data = JSON.parse(raw);
                const parsed = getQuestionsFromJson(data);

                if (!parsed.length) {
                    setQuestions([]);
                    setSelection("");
                    setParseError("В файле не найден массив questions.");
                    return;
                }

                setQuestions(parsed);
                setSelection(parsed.length > 1 ? `1:${parsed.length}` : "1");
                setParseError(null);
            } catch (e: any) {
                setQuestions([]);
                setSelection("");
                setParseError("Не удалось прочитать JSON файл.");
            } finally {
                setIsReading(false);
            }
        };

        reader.onerror = () => {
            setQuestions([]);
            setSelection("");
            setParseError("Не удалось прочитать файл.");
            setIsReading(false);
        };

        reader.readAsText(file);
    };

    const handleSubmit = async (replace = false) => {
        if (!questions.length) {
            toast.danger("Загрузите JSON с вопросами.");
            return;
        }
        if (parsedSelection.error) {
            toast.danger(parsedSelection.error);
            return;
        }
        if (!parsedSelection.indices.length) {
            toast.danger("Не выбран ни один вопрос.");
            return;
        }

        const payload: TestAutoFillPayload = {
            total: questions.length,
            questions,
            selection: selection.trim(),
            selectedIndexes: parsedSelection.indices,
            replace,
        };

        try {
            setIsSubmitting(true);
            await TestService.autoFillTest(testId, payload);
            toast.success("Вопросы добавлены в тест");
            onSuccess();
        } catch (e: any) {
            toast.danger(
                e?.response?.data?.message ||
                    "Не удалось импортировать вопросы",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5 pb-2">
            <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-700">
                    JSON файл с вопросами
                </div>
                <InputMedia
                    accept=".json,application/json"
                    multiple={false}
                    onChange={handleFileChange}
                    disabled={isReading || isSubmitting}
                />
                {parseError && (
                    <div className="text-sm text-rose-600">{parseError}</div>
                )}
            </div>

            {questions.length ? (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="text-sm font-semibold text-slate-700">
                            Какие вопросы импортировать
                        </div>
                        <InputSmall
                            placeholder="Например: 1,2,4:6"
                            value={selection}
                            onChange={(event) =>
                                setSelection(event.target.value)
                            }
                            className="py-2"
                        />
                        <div className="text-xs text-slate-500">
                            Форматы: 3, 1,4,7 или 5:10. Индексация с 1.
                        </div>
                        {parsedSelection.error && (
                            <div className="text-xs text-rose-600">
                                {parsedSelection.error}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700">
                            Всего вопросов: {total}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                            Выбрано: {parsedSelection.indices.length}
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {selectedQuestions.map((item, index) => {
                            const number = parsedSelection.indices[index];
                            const title =
                                item?.question || item?.title || "Без текста";
                            const type = item?.type
                                ? typeLabels[item.type]
                                : "Неизвестно";

                            return (
                                <div
                                    key={`json-preview-${number}`}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm"
                                >
                                    <div className="text-xs font-semibold text-slate-400">
                                        Вопрос {number}
                                    </div>
                                    <div className="mt-1 text-sm font-semibold text-slate-800 line-clamp-3">
                                        {title}
                                    </div>
                                    <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                        {type}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                    primary
                    className="px-4 py-2 flex-1"
                    onClick={() => handleSubmit(false)}
                    disabled={isReading || isSubmitting || !questions.length}
                >
                    {isSubmitting ? "Импортируем..." : "Импортировать в конец"}
                </Button>
                <Button
                    danger
                    className="px-4 py-2 flex-1"
                    onClick={() => setIsReplaceConfirmOpen(true)}
                    disabled={isReading || isSubmitting || !questions.length}
                >
                    Импортировать с заменой
                </Button>
            </div>
            <Modal
                open={isReplaceConfirmOpen}
                onClose={() => setIsReplaceConfirmOpen(false)}
                title={
                    <h3 className="text-lg font-semibold text-slate-800">
                        Подтвердите замену
                    </h3>
                }
                outsideClickClosing
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Все текущие вопросы будут удалены и заменены новыми.
                        Продолжить?
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            secondary
                            className="flex-1 p-2"
                            onClick={() => setIsReplaceConfirmOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            danger
                            className="flex-1 p-2"
                            onClick={async () => {
                                setIsReplaceConfirmOpen(false);
                                await handleSubmit(true);
                            }}
                        >
                            Заменить вопросы
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
